export class UnitTestTable implements IUnitTestTable {
    // The input element
	public el: HTMLDivElement;
    public table: HTMLTableElement;
	public flags: string;
	public testCases: Array<TestCase>;
    public testCaseCount: number;
    // if the matched groups should also be identical
    public strictGroup: boolean;
    public hintRevealed: Array<boolean>;
    // when true: match the whole string from the beginning to the end. When disabled: use findall.
    public strictMatch: boolean;
    private latestResults: Array<UnitTestResult>;

    private columnsEnabled: Array<string>;
    constructor() {
        // init the element in HTML 
        this.el = document.createElement('div');
        this.el.id = 'unittest-table';
        this.el.classList.add('regex-unittest');
        // the element is hidden initially.
        this.el.classList.add('collapse');

        // columns enabled besides the status column
        // TODO: only enabled notes for study 0 and 1
        this.columnsEnabled = ['actualOutput', 'expectedOutput', 'input', 'notes'];
        // this.columnsEnabled = ['notes'];

        this.table = document.createElement('table');
        this.el.appendChild(this.table);
        const tableHead = document.createElement('tr');
        tableHead.innerHTML = this._getTableHead();
        this.table.appendChild(tableHead);

        // no flags specified by default
        this.flags = '';

        // this.testCases = [{input: 'unicorn', expect: ['unicorn'], notes:'testing unicorn'}, {input: 'element', expect:['element']}, {input: 'banana', expect: []}, {input: 'apple', expect: []}];
        this.testCases = [];
        this.testCaseCount = 0;
        this.hintRevealed = [];
        this.latestResults = [];

        // not matching groups strictly by default
        this.strictGroup = false;

        // using strict match by default
        this.strictMatch = true;
    }

    // not used: Return value: 'Pass' if all pass, 'Error' if one error, 'Fail' if no error but at least one fail
    // return number of test cases passed
	public check = (regex: string) : number => {
        // assume pyodide is initiallized.
        // TODO: (robustness) test if pyodide is initialized
        let status: string = 'Pass';
        let passCount: number = 0;
        if (this.el.classList.contains('collapse')) {
            this.el.classList.remove('collapse');
        }
        // clean up previous unit test result 
        this.table.innerHTML = this.table.rows[0].innerHTML;
        this.latestResults = [];
        for (let index = 0; index < this.testCases.length; ++ index) {
            const caseStatus = this.match(index, regex, this.testCases[index]);
            status = caseStatus == 'Error' ? 'Error' : (caseStatus == 'Fail' ? 'Fail' : status);
            if (caseStatus == 'Pass') {
                passCount += 1;
            }
        }
        return passCount;
    }
    /**
     * Runs re.findall() with data from regex and test string input;
     * Highlights the result in the test string input;
     * Prints python output.
    */
    private match = (index: number, regex: string, testCase: TestCase): string => {
        const result: UnitTestResult = {success: false, match: null, errorMessage: null}; 
        let pydata = 'import re\n';
        window.pyodide.globals.running = true;
        window.pyodide.globals.unit_test_string = testCase.input;
        window.pyodide.globals.unit_regex_input = regex;
        if (this.flags != null && this.flags != '') {
            if (this.strictMatch) {
                pydata += 'unit_pattern = re.compile(' + '\'^\' + unit_regex_input + \'$\', '+this.flags+')\n';
            } else {
                pydata += 'unit_pattern = re.compile(unit_regex_input, '+this.flags+')\n';
            }
        } else {
            if (this.strictMatch) {
                pydata += 'unit_pattern = re.compile(' + '\'^\' + unit_regex_input + \'$\')\n';
            } else {
                pydata += 'unit_pattern = re.compile(unit_regex_input)\n';
            }
        }
        pydata += 'unit_source = unit_test_string\n';
        pydata += 'global unit_match_result\n';
        if (this.strictMatch) {
            pydata += 'unit_match_result_object = re.match(unit_pattern,unit_source)\n';
            pydata += 'if (unit_match_result_object):\n';
            pydata += '    unit_match_result = [unit_match_result_object.group(0)]\n';
            pydata += 'else:\n';
            pydata += '    unit_match_result = []\n';
        } else {
            pydata += 'unit_match_result = re.findall(unit_pattern,unit_source)\n';
        }
        try {
            window.pyodide.runPython(pydata);
            result.success = true;
            result.match = window.pyodide.globals.unit_match_result as Array<string>;
            return this._createRow(index, testCase, result);
        } catch(err) {
            result.success = false;
            result.errorMessage = String(err).replaceAll('<', '&lt;').replaceAll('>','&gt;').replaceAll('\n','<br/>').replaceAll(' ', '&nbsp;');
            // console.log(err);
            return this._createRow(index, testCase, result);
        }
    }

    // returns: 'Pass' if pass, 'Fail' if fail, 'Error' if error
    private _createRow = (index: number, testCase: TestCase, result: UnitTestResult): string => {
        // console.log(testCase);
        // console.log(result);
        this.latestResults.push(result);
        // creating the status(the first) column
        const row = document.createElement('tr');
        let status: string = result.success? (JSON.stringify(result.match) === JSON.stringify(testCase.expect) ? 'Pass' : 'Fail') : 'Error';
        const rowContent: string = '<td>'+status+'</td>';
        row.innerHTML = rowContent;
        this.table.append(row);
        if (!result.success) {
            (row.firstChild as HTMLTableDataCellElement).style.backgroundColor = 'red';
        } else if (JSON.stringify(result.match) === JSON.stringify(testCase.expect)) {
            (row.firstChild as HTMLTableDataCellElement).style.backgroundColor = 'green';
        } else {
            (row.firstChild as HTMLTableDataCellElement).style.backgroundColor = 'orange';
        }
        if (this.hintRevealed[index]) {
            row.innerHTML += this._getRevealedRow(testCase, result);
        } else {
            row.appendChild(this._getUnrevealedRow(index));
        }
        return status;
    }
    
    // html for a revealed row
    private _getRevealedRow = (testCase: TestCase, result: UnitTestResult): string => {
        let actualOutput: string = this.columnsEnabled.indexOf('actualOutput') == -1 ? '' : '<td>' + ( result.success? JSON.stringify(result.match) : String(result.errorMessage)) + '</td>';
        let expectedOutput: string = this.columnsEnabled.indexOf('expectedOutput') == -1 ? '' : '<td>' + JSON.stringify(testCase.expect) + '</td>';
        let input: string = this.columnsEnabled.indexOf('input') == -1 ? '' : '<td>' + testCase.input + '</td>';
        let notes: string = this.columnsEnabled.indexOf('notes') == -1 ? '' : '<td>' + (testCase.notes ? String(testCase.notes) : '--') + '</td>';
        return actualOutput + expectedOutput + input + notes;
    }

    private _getUnrevealedRow = (index: number): HTMLTableDataCellElement => {
        const td = document.createElement('td');
        td.colSpan = 4;
        const button = document.createElement('button');
        td.appendChild(button);
        button.innerText = 'Reveal Test Case ' + index.toString();
        button.setAttribute('id', index.toString());
        button.onclick = () => {
            this._revealRow(index);
        }
        return td;
    }

    // TODO
    private _revealRow = (index: number): void => {
        console.log('reveal row');
        console.log(index);
        this.hintRevealed[index] = true;
        const row = this.table.rows[index+1];
        if (row.lastChild) {
            row.removeChild(row.lastChild);
        }
        row.innerHTML += this._getRevealedRow(this.testCases[index], this.latestResults[index]);
    }

    public setTestCases = (testCases: Array<TestCase>): void => {
        this.testCases = testCases;
        // TODO: make this an option. Set all revealed for study 0 and 1.
        this.hintRevealed = Array(testCases.length).fill(true);
        this.testCaseCount = testCases.length;
    }

    private _getTableHead = (): string => {
        let actualOutput: string = this.columnsEnabled.indexOf('actualOutput') == -1 ? '' : '<td>Actual Value</td>';
        let expectedOutput: string = this.columnsEnabled.indexOf('expectedOutput') == -1 ? '' : '<td>Expected Value</td>';
        let input: string = this.columnsEnabled.indexOf('input') == -1 ? '' : '<td>Test Case</td>';
        let notes: string = this.columnsEnabled.indexOf('notes') == -1 ? '' : '<td>Notes</td>';
        return '<td>Result</td>' + actualOutput + expectedOutput + input + notes;
    }

    public setError = (): void => {
        if (this.el.classList.contains('collapse')) {
            this.el.classList.remove('collapse');
        }
        // clean up previous unit test result 
        this.table.innerHTML = this.table.rows[0].innerHTML;
        this.latestResults = [];
        for (let index = 0; index < this.testCases.length; ++ index) {
            this._createRow(index, this.testCases[index], {success: false, match: [], errorMessage: 'Pattern Error'});
        }
    }
}
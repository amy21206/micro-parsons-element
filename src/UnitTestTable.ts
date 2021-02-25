export class UnitTestTable implements IUnitTestTable {
    // The input element
	public el: HTMLDivElement;
    public table: HTMLTableElement;
	public flags: string;
	public testCases: Array<TestCase>;
    // if the matched groups should also be identical
    public strictGroup: boolean;
    public hintRevealed: Array<boolean>;
    private latestResults: Array<UnitTestResult>;
    constructor() {
        // init the element in HTML 
        this.el = document.createElement('div');
        this.el.id = 'unittest-table';
        this.el.classList.add('regex-unittest');
        // the element is hidden initially.
        this.el.classList.add('collapse');

        this.table = document.createElement('table');
        this.el.appendChild(this.table);
        const tableHead = document.createElement('tr');
        tableHead.innerHTML = '<td>Result</td><td>Actual Value</td><td>Expected Value</td><td>Test Case</td><td>Notes</td>'
        this.table.appendChild(tableHead);

        // no flags specified by default
        this.flags = '';

        // this.testCases = [{input: 'unicorn', expect: ['unicorn'], notes:'testing unicorn'}, {input: 'element', expect:['element']}, {input: 'banana', expect: []}, {input: 'apple', expect: []}];
        this.testCases = [];
        this.hintRevealed = [];
        this.latestResults = [];

        // not matching groups strictly by default
        this.strictGroup = false;
    }

	public check = (regex: string) : void => {
        // assume pyodide is initiallized.
        // TODO: (robustness) test if pyodide is initialized
        if (this.el.classList.contains('collapse')) {
            this.el.classList.remove('collapse');
        }
        // clean up previous unit test result 
        this.table.innerHTML = this.table.rows[0].innerHTML;
        this.latestResults = [];
        for (let index = 0; index < this.testCases.length; ++ index) {
            this.match(index, regex, this.testCases[index]);
        }
    }
    /**
     * Runs re.findall() with data from regex and test string input;
     * Highlights the result in the test string input;
     * Prints python output.
    */
    private match = (index: number, regex: string, testCase: TestCase): void => {
        const result: UnitTestResult = {success: false, match: null, errorMessage: null}; 
        let pydata = 'import re\n';
        window.pyodide.globals.running = true;
        window.pyodide.globals.unit_test_string = testCase.input;
        window.pyodide.globals.unit_regex_input = regex;
        if (this.flags != null && this.flags != '') {
            pydata += 'unit_pattern = re.compile(unit_regex_input, '+this.flags+')\n';
        } else {
            pydata += 'unit_pattern = re.compile(unit_regex_input)\n';
        }
        pydata += 'unit_source = unit_test_string\n';
        pydata += 'global unit_match_result\n';
        pydata += 'unit_match_result = re.findall(unit_pattern,unit_source)\n';
        try {
            window.pyodide.runPython(pydata);
            result.success = true;
            result.match = window.pyodide.globals.unit_match_result as Array<string>;
            this._createRow(index, testCase, result);
        } catch(err) {
            result.success = false;
            result.errorMessage = String(err).replaceAll('<', '&lt;').replaceAll('>','&gt;').replaceAll('\n','<br/>').replaceAll(' ', '&nbsp;');
            // console.log(err);
            this._createRow(index, testCase, result);
        }
    }

    private _createRow = (index: number, testCase: TestCase, result: UnitTestResult): void => {
        // console.log(testCase);
        // console.log(result);
        this.latestResults.push(result);
        // creating the status(the first) column
        const row = document.createElement('tr');
        let status: string = result.success? String(JSON.stringify(result.match) === JSON.stringify(testCase.expect)) : 'error';
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
    }
    
    // html for a revealed row
    private _getRevealedRow = (testCase: TestCase, result: UnitTestResult): string => {
        let actualOutput: string = result.success? JSON.stringify(result.match) : String(result.errorMessage);
        let expectedOutput: string = JSON.stringify(testCase.expect);
        let input: string = testCase.input;
        let notes: string = testCase.notes ? String(testCase.notes) : '--';
        const rowContent: string = '<td>'+actualOutput+'</td><td>'+expectedOutput+'</td><td>"'+input+'"</td><td>'+notes+'</td>';
        return rowContent;
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
        this.hintRevealed = Array(testCases.length).fill(false);
    }
}
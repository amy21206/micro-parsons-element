export class UnitTestTable implements IUnitTestTable {
    // The input element
	public el: HTMLDivElement;
    public table: HTMLTableElement;
	public flags: string;
	public testCases: Array<TestCase>;
    // if the matched groups should also be identical
    public strictGroup: boolean;
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
        this.testCases.forEach(testCase => {
            // while(window.pyodide.globals.running)
            this.match(regex, testCase);
        })
    }
    /**
     * Runs re.findall() with data from regex and test string input;
     * Highlights the result in the test string input;
     * Prints python output.
    */
    private match = (regex: string, testCase: TestCase): void => {
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
            this._createRow(testCase, result);
        } catch(err) {
            result.success = false;
            result.errorMessage = String(err).replaceAll('<', '&lt;').replaceAll('>','&gt;').replaceAll('\n','<br/>').replaceAll(' ', '&nbsp;');
            // console.log(err);
            this._createRow(testCase, result);
        }
    }

    private _createRow = (testCase: TestCase, result: UnitTestResult): void => {
        // console.log(testCase);
        // console.log(result);
        const row = document.createElement('tr');
        let test1: string = result.success? String(JSON.stringify(result.match) === JSON.stringify(testCase.expect)) : 'error';
        let test2: string = result.success? JSON.stringify(result.match) : String(result.errorMessage);
        let test3: string = JSON.stringify(testCase.expect);
        let test4: string = testCase.notes ? String(testCase.notes) : '--';
        const rowContent: string = '<td>'+test1+'</td><td>'+test2+'</td><td>'+test3+'</td><td>"'+testCase.input+'"</td><td>'+test4+'</td>';
        row.innerHTML = rowContent;
        this.table.append(row);
        if (!result.success) {
            (row.firstChild as HTMLTableDataCellElement).style.backgroundColor = 'red';
        } else if (JSON.stringify(result.match) === JSON.stringify(testCase.expect)) {
            (row.firstChild as HTMLTableDataCellElement).style.backgroundColor = 'green';
        } else {
            (row.firstChild as HTMLTableDataCellElement).style.backgroundColor = 'orange';
        }
    }
}
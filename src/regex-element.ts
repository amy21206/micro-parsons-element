import { ParsonsInput } from './ParsonsInput';
import { languagePluginLoader } from './external/pyodide';
import { RegexInput } from './RegexInput';
import { TestStringInput } from './TestStringInput';
import { StatusOutput } from './StatusOutput';
import { TestButton } from './TestButton';
import { RegexOptions } from './RegexOptions';
import { UnitTestTable } from './UnitTestTable';
import { RegexToolS3BucketLogger } from 'schema_logger/dist/loggers/regex_tool_s3_bucket_logger';
import { RegexStatusTag } from './RegexStatusTag';
import { RegexEvent } from './LoggingEvents';

declare global {
    interface Window {
        languagePluginUrl: string
        pyodide: Pyodide
    }
}

export class RegexElement extends HTMLElement {

    private root: ShadowRoot;

    private _parsonsData: Array<string>;
    public parsonsExplanation: Array<string> | null;
    public regexInput: IRegexInput;
    private inputType: string;

    private regexStatus: RegexStatusTag;
    private regexErrorMessage: HTMLDivElement;

    // The input box for test string (with highlight)
    public testStringInput: TestStringInput;
    private initialTestString: string;

    // Python output
    public statusOutput: StatusOutput;

    // The button to trigger matching
    public testButton: TestButton;

    // *temporary: The checkbox to enable always check (will be integrated in options later)
    private checkWhileTyping: boolean;

    // Saving previous checked text, used with checkWhileTyping
    private prevText: string;

    private matchResult: Array<Array<MatchGroup>>;

    // random color representations for groups
    public groupColor: Array<string>;

    private regexOptions: RegexOptions;

    // unit tests
    public unitTestTable: UnitTestTable;

    // private logger: Logger;
    private logger: RegexToolS3BucketLogger;

    private patternValidFlag: boolean;

    // data for logging
    public studentId: string;
    public problemId: string;

    public temporaryInputEvent: any;

    private pyodideInitialized: boolean;

    private _testStatusDiv: HTMLDivElement;

    constructor() {
        super();

        // this.logger = new ConsoleLogger();
        this.logger = new RegexToolS3BucketLogger({
            api: "https://cjglpwd044.execute-api.us-east-1.amazonaws.com/regex-tool-api-aws-edtech-labs-si-umich-edu",
            bucket: "regex-tool-s3-aws-edtech-labs-si-umich-edu",
            path: "pilot"
        });

        this.root = this.attachShadow({ mode: 'open' });

        // init pyodide
        // window.languagePluginUrl = 'https://cdn.jsdelivr.net/pyodide/v0.16.1/full/';
        window.languagePluginUrl = 'http://127.0.0.1:8081/pyodide/';
        this.pyodideInitialized = false;
        this.initPyodide();

        // add style
        this.addStyle();

        // init element: button for unittest
        // const unitTestButton = document.createElement('button');
        // unitTestButton.innerText = 'Run Unit Test';
        // this.root.appendChild(unitTestButton);
        // unitTestButton.onclick = () => this.unitTestTable.check(this.regexInput.getText());

        // init elements: button for match
        // TODO: disabled the button for study 0 and 1.
        // this.root.appendChild(document.createElement('br'));
        this.testButton = new TestButton();
        // this.root.appendChild(this.testButton.el);
        // this.testButton.el.onclick = this.match;

        // init elements: checkbox
        // TODO[feature]: replace this with an option module 
        // const checkbox = document.createElement('input');
        // checkbox.setAttribute('type', 'checkbox');
        // checkbox.checked = false;
        // this.root.appendChild(checkbox);
        // this.root.append('always check on input');
        // this.checkWhileTyping = false;
        // checkbox.addEventListener('change', () => {
        //     this.checkWhileTyping = checkbox.checked;
        //     if (this.checkWhileTyping) {
        //         this.match();
        //     }
        // })

        // TODO: make this an option; for now always enabled the 'always check' for study 0 and 1.
        this.checkWhileTyping = true;

        // a div wrapping the input and the test case status
        const inputAndTestStatusDiv = document.createElement('div');
        this.root.append(inputAndTestStatusDiv);
        inputAndTestStatusDiv.classList.add('regex-input-and-test-status');

        // init regex input based on the input type
        // TODO: (bug) fix always check for parsons
        this.patternValidFlag = true;
        let inputType = this.getAttribute('input-type');
        this.inputType = inputType == 'parsons' ? 'parsons' : 'text';
        this._parsonsData = new Array<string>();
        this.parsonsExplanation = null;
        const inputDiv = document.createElement('div');
        inputAndTestStatusDiv.appendChild(inputDiv);
        inputDiv.classList.add('regex-input-div');
        inputDiv.append('Your regular expression:');
        this.regexStatus = new RegexStatusTag();
        inputDiv.appendChild(this.regexStatus.el);
        inputDiv.appendChild(document.createElement('br'));
        // todo:(UI) fix the css for the input
        if (this.inputType == 'parsons') {
            // init elements: parsons regex input
            this.regexInput = new ParsonsInput();
            inputDiv.appendChild(this.regexInput.el);
            this.regexInput.el.addEventListener('regexChanged', () => {
                if (this.checkWhileTyping) {
                    this.patternValidFlag = this.pyodide_compilePattern();
                    // log regex input event
                    this._logRegexInputEvent();
                    if (this.patternValidFlag) {
                        this.regexStatus.updateStatus('valid');
                        // check and update the background color of the parsons input based on the unit test results
                        const passCount = this.unitTestTable.check(this.regexInput.getText());
                        this.regexInput.updateTestStatus(passCount == this.unitTestTable.testCaseCount ? 'Pass' : 'Fail');
                        this._testStatusDiv.className = '';
                        this._testStatusDiv.classList.add('regex-test-status');
                        this._testStatusDiv.classList.add(passCount == this.unitTestTable.testCaseCount ? 'Pass' : 'Fail');
                        this._testStatusDiv.innerText = 'Test cases passed: ' + passCount + '/' + this.unitTestTable.testCaseCount;
                        this.match();
                        if (passCount === this.unitTestTable.testCaseCount) {
                            console.log('dispatch');
                            this.dispatchEvent(new CustomEvent('passed-all-testcases'));
                        }
                    } else {
                        this.regexStatus.updateStatus('error');
                        this.regexInput.updateTestStatus('Error');
                        this.testStringInput.quill?.removeFormat(0, this.testStringInput.quill.getLength() - 1, 'silent');
                        this._testStatusDiv.innerText = 'Test cases passed: 0/' + this.unitTestTable.testCaseCount;
                        this.unitTestTable.setError();
                    }
                }
            }, false)
        } else {
            // (this.inputType == 'text')
            const regex_slot = document.createElement('slot');
            regex_slot.name = 'regex-input'
            inputDiv.appendChild(regex_slot);
            // TODO: (refactor) rename RegexInput
            this.regexInput = new RegexInput();
            this.appendChild(this.regexInput.el);
            this.regexInput.el.slot = 'regex-input';
            (this.regexInput as RegexInput).initQuill();
            (this.regexInput as RegexInput).quill?.on('text-change', (delta) => {
                // logging free input event
                this.temporaryInputEvent = {
                    'event-type': 'free-input',
                    dropped: (this.regexInput as RegexInput).droppedText,
                    delta: delta,
                    answer: this.regexInput.getText()
                };
                (this.regexInput as RegexInput).droppedText = false;
                // update status indicator
                this.patternValidFlag = this.pyodide_compilePattern();
                if (this.patternValidFlag) {
                    this.regexStatus.updateStatus('valid');
                } else {
                    this.regexStatus.updateStatus('error');
                }
                console.log(this.patternValidFlag);
                this._logRegexInputEvent();
                if (this.checkWhileTyping) {
                    if (this.patternValidFlag) {
                        // only match when the pattern is valid
                        const passCount = this.unitTestTable.check(this.regexInput.getText());
                        this.regexInput.updateTestStatus(passCount == this.unitTestTable.testCaseCount ? 'Pass' : 'Fail');
                        this._testStatusDiv.innerText = 'Test cases passed: ' + passCount + '/' + this.unitTestTable.testCaseCount;
                        this._testStatusDiv.className = '';
                        this._testStatusDiv.classList.add('regex-test-status');
                        this._testStatusDiv.classList.add(passCount == this.unitTestTable.testCaseCount ? 'Pass' : 'Fail');
                        this.match();
                        if (passCount === this.unitTestTable.testCaseCount) {
                            console.log('dispatch');
                            this.dispatchEvent(new CustomEvent('passed-all-testcases'));
                        }
                    } else {
                        this.regexInput.updateTestStatus('Error');
                        this.testStringInput.quill?.removeFormat(0, this.testStringInput.quill.getLength() - 1, 'silent');
                        this._testStatusDiv.innerText = 'Test cases passed: 0/' + this.unitTestTable.testCaseCount;
                        this.unitTestTable.setError();
                    }
                    // check and update the background color of the parsons input based on the unit test results
                }
            })
        }
        this.regexInput.parentElement = this;
        this.regexErrorMessage = document.createElement('div');
        this.regexErrorMessage.classList.add('regex-error-message');
        inputDiv.appendChild(this.regexErrorMessage);

        // init elements: regex options dropdown
        this.regexOptions = new RegexOptions();
        // inputDiv.appendChild(this.regexOptions.el);

        this._testStatusDiv = document.createElement('div');
        inputAndTestStatusDiv.appendChild(this._testStatusDiv);
        this._testStatusDiv.classList.add('regex-test-status');

        // init elements: test string input
        // TODO: (bug) stylesheet isn't working with shadowroot
        const quillLinkRef = document.createElement('link');
        quillLinkRef.href = 'https://cdn.quilljs.com/1.3.7/quill.bubble.css';
        quillLinkRef.rel = 'stylesheet';
        this.appendChild(quillLinkRef);

        const testStringDiv = document.createElement('div');
        this.root.append(testStringDiv);
        testStringDiv.classList.add('regex-test-string-div');
        testStringDiv.append('Feel free to experiment with your own test cases.');

        this.initialTestString = '';
        const slot = document.createElement('slot');
        slot.name = 'test-string-input'
        testStringDiv.appendChild(slot);

        const resetTestStringButton = document.createElement('button');
        testStringDiv.appendChild(document.createElement('br'));
        testStringDiv.appendChild(resetTestStringButton);
        resetTestStringButton.innerText = 'Reset'
        resetTestStringButton.onclick = this.resetTestString;

        this.testStringInput = new TestStringInput();
        this.appendChild(this.testStringInput.el);
        this.testStringInput.el.slot = 'test-string-input';
        this.testStringInput.initQuill();
        this.prevText = this.testStringInput.getText();
        this.testStringInput.parentElement = this;
        this.testStringInput.quill?.on('text-change', (delta, _, source) => {
            if (source == 'user') {
                const testStringInputEvent: RegexEvent.TestStringInputEvent = {
                    'event-type': 'test-string-input',
                    dropped: this.testStringInput.droppedText,
                    delta: delta,
                    'test-string': this.testStringInput.getText()
                }
                this.logEvent(testStringInputEvent);
            }
            this.testStringInput.droppedText = false;
            if (this.testStringInput.getText() != this.prevText) {
                this.prevText = this.testStringInput.getText();
                // updating test_string in pyodide
                // window.pyodide.globals.test_string = this.testStringInput.getText().slice(0, -1);
                if (this.pyodideInitialized && this.checkWhileTyping && this.patternValidFlag) {
                    this.match();
                } else {
                    this.testStringInput.quill?.removeFormat(0, this.testStringInput.quill.getLength() - 1, 'silent');
                }
            }
        })

        // init element: unit test table
        this.unitTestTable = new UnitTestTable();
        this.root.appendChild(this.unitTestTable.el);

        // init element: python output
        this.statusOutput = new StatusOutput();
        this.root.appendChild(this.statusOutput.el);

        // initialize the match result array
        this.matchResult = new Array<Array<MatchGroup>>();

        // initialize the color array
        // TODO: (UI) only light colors that do not obfuscates the word
        this.groupColor = new Array<string>();

        // logging page visibility
        if (typeof document.addEventListener === "undefined" || document.hidden === undefined) {
            const visibilityStatusEvent: RegexEvent.PageVisibilityCapturable = {
                'event-type': 'page-visibility-status',
                enabled: false
            }
            this.logEvent(visibilityStatusEvent);
            console.log("visibility not working");
        } else {
            const visibilityStatusEvent: RegexEvent.PageVisibilityCapturable = {
                'event-type': 'page-visibility-status',
                enabled: true
            }
            this.logEvent(visibilityStatusEvent);
            console.log("add visibility change");
            document.addEventListener("visibilitychange", (event) => {
                let pageStatusEvent: RegexEvent.PageStatusEvent;
                if (document.hidden) {
                    pageStatusEvent = {
                        'event-type': 'page-status',
                        'status-type': RegexEvent.PageStatus.VISIBILITY,
                        result: false
                    }
                } else {
                    pageStatusEvent = {
                        'event-type': 'page-status',
                        'status-type': RegexEvent.PageStatus.VISIBILITY,
                        result: true
                    }
                }
                this.logEvent(pageStatusEvent);
            }, false);
        }

        // logging window blur & focus
        window.addEventListener('blur', () => {
            const blurEvent: RegexEvent.PageStatusEvent = {
                'event-type': 'page-status',
                'status-type': RegexEvent.PageStatus.FOCUS,
                result: false
            }
            this.logEvent(blurEvent);
        })
        window.addEventListener('focus', () => {
            const focusEvent: RegexEvent.PageStatusEvent = {
                'event-type': 'page-status',
                'status-type': RegexEvent.PageStatus.FOCUS,
                result: true
            }
            this.logEvent(focusEvent);
        })

        // stub for student and problem id
        this.studentId = this._getStudentIdFromURL();
        this.problemId = this.getAttribute('problem-id') || 'stub-problem-id';
        console.log(this.studentId);
        console.log(this.problemId);

        this.temporaryInputEvent = null;
    }

    set parsonsData(data: Array<string>) {
        this._parsonsData = data;
        if (this.inputType == 'parsons') {
            (this.regexInput as ParsonsInput).setSourceBlocks(data, this.parsonsExplanation);
        }
    }

    get parsonsData(): Array<string> {
        return this._parsonsData;
    }


    // Initializes Pyodide
    // ref: https://pyodide.readthedocs.io/en/latest/usage/quickstart.html
    private initPyodide = (): void => {
        languagePluginLoader.then(() => {
            this.statusOutput.text.value += "Init finished.\n";
            window.pyodide.globals.test_string = this.prevText;
            this.pyodideInitialized = true;
        });
    }

    // TODO[refactor]: put stylesheet in a separate css/scss file
    private addStyle = (): void => {
        const sheet = document.createElement('style');
        sheet.innerHTML += '.regex-textbox {width: 100%; visibility: collapse;}\n';
        sheet.innerHTML += '.regex-input-and-test-status {display: flex; flex-wrap: nowrap;}\n';
        sheet.innerHTML += '.regex-test-status {font-family: monospace; font-size: 15px; color:black; padding:20px 0 0 10px;height: fit-content;}\n';
        sheet.innerHTML += '.regex-test-status.Fail {font-family: monospace; font-size: 15px; color:#ebd071;}\n';
        sheet.innerHTML += '.regex-test-status.Pass {font-family: monospace; font-size: 15px; color:green;}\n';
        // regex status tag
        sheet.innerHTML += '.regex-status { border-radius: 4px; visibility: collapse; font-family: monospace; padding: 3px 6px; margin: 2px 10px; color: #fff; }\n';
        sheet.innerHTML += '.regex-status.error { visibility: visible; background-color: red; }\n';
        sheet.innerHTML += '.regex-status.valid { visibility: visible; background-color: green; }\n';
        sheet.innerHTML += '.parsons-selected {background-color: red;}\n';
        // regex error message
        sheet.innerHTML += '.regex-error-message {color: red; font-family: monospace; font-size: 15px;}\n';
        sheet.innerHTML += '.regex-error-message.hidden {visibility: collapse;}\n';
        // parsons block
        sheet.innerHTML += '.parsons-block {display: inline-block; font-family: monospace; font-size: large; background-color: white; padding: 1px 2px; border: 1px solid; border-color:gray; margin: 0 1px; border-radius: 2px; position: relative;}\n';
        sheet.innerHTML += '.parsons-block:hover, .parsons-block:focus { border-color: black; padding: 0 6px; border: 2px solid;}\n';
        sheet.innerHTML += '.drop-area { background-color: #b1dafa; }\n';
        sheet.innerHTML += '.drop-area.Pass { background-color: #bcebd7; }\n';
        sheet.innerHTML += '.drop-area.Fail { background-color: #ebd071; }\n';
        sheet.innerHTML += '.drop-area.Error { background-color: #ff99b3; }\n';
        // TODO:(UI) move the tooltip to the top of the line
        sheet.innerHTML += '.parsons-block .tooltip { visibility: hidden; width: 200px;  background-color: black; color: #fff; text-align: center; padding: 5px 0; border-radius: 6px;  position: absolute; z-index: 1; margin: 0 10px; bottom: 120%; margin-left: -100px;}\n';
        sheet.innerHTML += '.parsons-block .tooltip::after {content: " ";position: absolute; top: 100%;left: 50%; margin-left: -5px; border-width: 5px; border-style: solid; border-color: black transparent transparent transparent;}\n';
        sheet.innerHTML += '.drag-area .parsons-block:hover .tooltip { visibility: visible;}\n';
        sheet.innerHTML += '.drag-area{ width: 510px;}\n';
        sheet.innerHTML += '.regex-test-string-div, .regex-input-div { margin: 8px 0; height: fit-content; }\n';
        sheet.innerHTML += '.regex-input-div { width: 80%; }\n';
        sheet.innerHTML += '.regex-input-div > div {display:inline-block;}\n'
        // the dropdown menu for regex options
        sheet.innerHTML += '.regex-options-dropdown-btn { background-color: #3498DB; color: white; padding: 10px; font-size: 16px; border: none; cursor: pointer;}\n';
        sheet.innerHTML += '.regex-options-dropdown-btn:hover, .regex-options-dropdown-btn:focus { background-color: #2980B9;}\n';
        sheet.innerHTML += '.regex-options-dropdown { position: relative; display: inline-block; }\n';
        sheet.innerHTML += '.regex-options-container { display: none; position: absolute; background-color: #f1f1f1; min-width: 160px; box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);z-index: 1;}\n'
        sheet.innerHTML += '.regex-options-container > button{ color: black; padding: 12px 16px; text-decoration: none; display: block; width: -webkit-fill-available;}\n';
        sheet.innerHTML += '.regex-options-container .selected{ background-color: pink;}\n'
        sheet.innerHTML += '.show {display:block;}\n';
        // unittest
        sheet.innerHTML += '.regex-unittest > table, .regex-unittest td {border: 1px solid black; padding: 3px; text-align: center; border-collapse: collapse;}\n'
        sheet.innerHTML += '.regex-unittest.collapse{visibility: collapse;}\n'
        // for study 0: hide the table
        sheet.innerHTML += '.regex-unittest{visibility: collapse;}\n'

        document.body.appendChild(sheet);
        this.root.appendChild(sheet);

        const global_sheet = document.createElement('style');
        global_sheet.innerHTML += '.regex-test-string .ql-editor, .regex-input .ql-editor { padding: 5px; border: 1px solid; border-radius: 3px; font-family: monospace; font-size: 14px; box-shadow: inset 0 1px 2px rgb(0 0 0 / 10%); line-height: 18px; letter-spacing: 0.5px;}\n';
        global_sheet.innerHTML += '.regex-input .ql-editor {height: fit-content;}\n';
        global_sheet.innerHTML += '.ql-editor { box-shadow: 0 0 2px 5px #b1dafa; margin: 5px; }\n';
        global_sheet.innerHTML += '.Pass .ql-editor { box-shadow: 0 0 2px 5px #bcebd7; margin: 5px; }\n';
        global_sheet.innerHTML += '.Fail .ql-editor { box-shadow: 0 0 2px 5px #ebd071; margin: 5px; }\n';
        global_sheet.innerHTML += '.Error .ql-editor { box-shadow: 0 0 2px 5px #ff99b3; margin: 5px; }\n';
        this.appendChild(global_sheet);
    }

    /**
     * Runs re.findall() with data from regex and test string input;
     * Highlights the result in the test string input;
     * Prints python output.
    */
    public match = (): void => {
        this.statusOutput.text.value = ''
        let pydata = 'import re\n';
        window.pyodide.globals.test_string = this.prevText;
        window.pyodide.globals.regex_input = this.regexInput.getText();
        if (this.regexOptions.getFlags() != null) {
            pydata += 'pattern = re.compile(regex_input, ' + this.regexOptions.getFlags() + ')\n';
        } else {
            pydata += 'pattern = re.compile(regex_input)\n';
        }
        pydata += 'source = test_string\n';
        pydata += 'global match_result\n';
        pydata += 'match_result = []\n';
        // TODO: (performance)try to reduce assigning data here
        pydata += 'for match_obj in re.finditer(pattern, source):\n';
        pydata += '    match_data = []\n';
        pydata += '    match_result.append(match_data)\n';
        pydata += '    for group_id in range(pattern.groups + 1):\n';
        pydata += '        group_data = {}\n';
        pydata += '        match_data.append(group_data)\n';
        pydata += '        group_data[\'group_id\'] = group_id\n';
        pydata += '        group_data[\'start\'] = match_obj.start(group_id)\n';
        pydata += '        group_data[\'end\'] = match_obj.end(group_id)\n';
        pydata += '        group_data[\'data\'] = match_obj.group(group_id)\n';
        pydata += '    for name, index in pattern.groupindex.items():\n';
        pydata += '        match_data[index][\'name\'] = name\n';
        window.pyodide.runPythonAsync(pydata)
            .then(_ => {
                // TODO: (robustness)test edge cases with no match
                this.matchResult = window.pyodide.globals.match_result as Array<Array<MatchGroup>>;
                this.addMatchResultToOutput();
                // TODO: (feature)fix highlighting with group information
                this.testStringInput.updateGroupedMatchResult(this.matchResult, this.groupColor);
                // this.testStringInput.updateGroupedMatchResult_exp(this.matchResult);
                // log match result
                // TODO: it is always auto in this study, but could change in other studies
                const matchTestStringEvent: RegexEvent.MatchTestStringEvent = {
                    'event-type': 'match',
                    trigger: RegexEvent.MatchTriggerType.AUTO,
                    regex: this.regexInput.getText(),
                    'test-string': this.prevText,
                    flags: this.regexOptions.getFlagList(),
                    "match-result": this.matchResult
                }
                this.logEvent(matchTestStringEvent);
            })
            .catch((err) => { this.addTextToOutput(err) });
    }

    /**
     * Runs re.compile() without flags
    */
    public pyodide_compilePattern = (): boolean => {
        // console.log('compile')
        // if (this.regexInput.getText() == '') {
        //     console.log('empty')
        //     this.regexErrorMessage.innerText = 'empty pattern';
        //     return false;
        // }
        this.statusOutput.text.value = ''
        let pydata = 'import re\n';
        window.pyodide.globals.regex_input = this.regexInput.getText();
        pydata += 'compiled_pattern = re.compile(regex_input)\n';
        let successFlag = false;
        try {
            window.pyodide.runPython(pydata);
            successFlag = true;
            this.regexErrorMessage.classList.add('hidden');
            this.regexErrorMessage.innerText = 'No Error';
        } catch (err) {
            successFlag = false;
            // updates error message
            const regexError = String(err).split('\n');
            const errorMessage = regexError[regexError.length - 2];
            console.log(errorMessage);
            this.regexErrorMessage.innerText = errorMessage;
            if (this.regexErrorMessage.classList.contains('hidden')) {
                this.regexErrorMessage.classList.remove('hidden');
            }
        }
        return successFlag;
    }

    private addToOutput = (originalOutput: Array<string | Array<string>>): void => {
        let output = '';
        originalOutput.forEach(element => {
            output += '(' + element.toString() + '),';
        });
        this.statusOutput.text.value += '>>>' + this.regexInput.getText() + '\n' + output + '\n';
    }

    private addTextToOutput = (output: string): void => {
        this.statusOutput.text.value += '>>>' + this.regexInput.getText() + '\n' + output + '\n';
    }

    private addMatchResultToOutput = (): void => {
        let output = '';
        for (let i = 0; i < this.matchResult.length; ++i) {
            output += 'Match ' + i.toString() + ':\n';
            for (let j = 0; j < this.matchResult[i].length; ++j) {
                output += 'Group ' + j.toString() + ': ';
                output += this.matchResult[i][j].data + ' span(' + this.matchResult[i][j].start + ', ' + this.matchResult[i][j].end + ') ';
                if (this.matchResult[i][j].name) {
                    output += this.matchResult[i][j].name;
                }
                output += '\n';
            }
            output += '\n';
        }
        this.statusOutput.text.value += '>>>\n' + output;
    }

    public setInitialTestString(text: string) {
        this.testStringInput.setText(text);
        this.initialTestString = text;
    }

    public setTestCases(testCases: Array<TestCase>) {
        console.log('set test cases');
        this.unitTestTable.setTestCases(testCases);
    }

    private resetTestString = (): void => {
        const testStringResetEvent: RegexEvent.TestStringResetEvent = {
            'event-type': 'test-string-reset',
            'test-string': this.initialTestString
        };
        this.logEvent(testStringResetEvent);
        this.testStringInput.setText(this.initialTestString);
    }

    public logEvent = (eventContent: any): void => {
        const basicEvent: RegexEvent.BasicEvent = {
            'student-id': this.studentId,
            'problem-id': this.problemId,
            'client-timestamp': this._getTimestamp()
        };
        // console.log({...basicEvent, ...eventContent});
        this.logger.info({
            ...basicEvent,
            ...eventContent
        });
    }

    private _getTimestamp = (): string => {
        const timestamp = new Date();
        return timestamp.getFullYear() + '/' + (timestamp.getMonth() + 1) + '/' + timestamp.getDate() + '/' + timestamp.getHours() + '/' + timestamp.getMinutes() + '/' + timestamp.getSeconds() + '/' + timestamp.getMilliseconds();
    }

    // log regex input event along with compilation result
    private _logRegexInputEvent = (): void => {
        // TODO: just using any here. but regexInputEvent is actually RegexEvent.ParsonsInputEvent or FreeInputEvent... so much trouble with typing!!
        let regexInputEvent: any = {
            ...this.temporaryInputEvent,
            valid: this.patternValidFlag
        };
        if (!this.patternValidFlag) {
            regexInputEvent['error-message'] = this.regexErrorMessage.innerText;
        }
        this.logEvent(regexInputEvent);
    }

    private _getStudentIdFromURL = (): string => {
        const queryString = document.location.search;
        const urlParams = new URLSearchParams(queryString);
        const studentId = urlParams.get('student-id') || 'stub-student-id';
        return studentId;
    }

}

customElements.define('regex-element', RegexElement);
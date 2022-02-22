import { ParsonsInput } from './ParsonsInput';
import { TextInput } from './TextInput';
import { TestStringInput } from './TestStringInput';
import { StatusOutput } from './StatusOutput';
import { RegexOptions } from './RegexOptions';
import { UnitTestTable } from './UnitTestTable';
import { RegexStatusTag } from './RegexStatusTag';
import { RegexEvent } from './LoggingEvents';

declare global {
    interface Window {
        languagePluginUrl: string
        Sk: Skulpt
        regexStudentId: string
        regexCourseId: string
    }
}

export class RegexElement extends HTMLElement {

    private root: ShadowRoot;

    private _parsonsData: Array<string>;
    public parsonsExplanation: Array<string> | null;
    public regexInput: IRegexInput;
    private inputType: string;

    private regexStatus: RegexStatusTag;
    // private regexErrorMessage: HTMLDivElement;
    // private regexErrorPosition: number;

    // The input box for positive test strings (with highlight)
    public positiveTestStringInput: TestStringInput;
    private positiveInitialTestString: string;
    // Saving previous checked text, used with checkWhileTyping
    private positivePrevText: string;

    // The input box for negative test strings (with highlight)
    public negativeTestStringInput: TestStringInput;
    private negativeInitialTestString: string;
    // Saving previous checked text, used with checkWhileTyping
    private negativePrevText: string;

    // Python output
    public statusOutput: StatusOutput;

    // *temporary: The checkbox to enable always check (will be integrated in options later)
    private checkWhileTyping: boolean;

    private positiveMatchResult: Array<Array<MatchGroup>>;
    private negativeMatchResult: Array<Array<MatchGroup>>;

    // random color representations for groups
    public groupColor: Array<string>;

    private regexOptions: RegexOptions;

    // unit tests
    public unitTestTable: UnitTestTable;

    // private logger: Logger;
    private patternValidFlag: boolean;

    // data for logging
    public studentId: string;
    public problemId: string;

    public temporaryInputEvent: any;

    private _testStatusDiv: HTMLDivElement;

    // highlights the result using findall. used for study 1 and 2.
    public matchFindall: boolean;

    public static toolCount: number = 0;

    public toolNumber: number;

    public outf(text: string) {
        // console.log('sk output')
        // console.log(text)
    }
    public builtinRead(x: any) {
        if (window.Sk.builtinFiles === undefined || window.Sk.builtinFiles["files"][x] === undefined)
            throw "File not found: '" + x + "'";
        return window.Sk.builtinFiles["files"][x];
    }

    // copied from Skulpt source code
    static _Sk_validGroups = ["(?:", "(?=", "(?!"];
    private _Sk_convert = (pattern: string): any => {
        var newpattern;
        var match;
        var i;
        // Look for disallowed constructs
        match = pattern.match(/\(\?./g);
        if (match) {
            for (i = 0; i < match.length; i++) {
                if (RegexElement._Sk_validGroups.indexOf(match[i]) == -1) {
                    throw new window.Sk.builtin.ValueError("Disallowed group in pattern: '"
                        + match[i] + "'");
                }
            }
        }
        newpattern = pattern.replace("/\\/g", "\\\\");
        newpattern = pattern.replace(/([^\\]){,(?![^\[]*\])/g, "$1{0,");
        return newpattern;
    };

    // adapted from Skulpt source code (findall)
    // problem: can only show the first and last match of the position, no grouping information
    private _Sk_finditer = (pattern: string, string: string, flags: string = 'gm'): Array<{st: number, ed: number}> => {
        let pat = pattern;
        let str = string;
        pat = this._Sk_convert(pat);
        // flags can only be global, ignorecase, and multiline
        let regex = new RegExp(pat, flags);
        if (pat.match(/\$/)) {
            var newline_at_end = new RegExp(/\n$/);
            if (str.match(newline_at_end)) {
                str = str.slice(0, -1);
            }
        }
        let match_result = [];
        let pos_result = [];
        let match;
        while ((match = regex.exec(str)) != null) {
            // console.log(match)
            // console.log("Matched '" + match[0] + "' at position " + match.index +
            //      "; next search at " + regex.lastIndex);
            // console.log("match: " + JSON.stringify(match));
            pos_result.push({st: match.index, ed: regex.lastIndex})
            if (match.length < 2) {
                match_result.push(new window.Sk.builtin.str(match[0]));
            } else if (match.length == 2) {
                match_result.push(new window.Sk.builtin.str(match[1]));
            } else {
                var groups = [];
                for (var i = 1; i < match.length; i++) {
                    groups.push(new window.Sk.builtin.str(match[i]));
                }
                match_result.push(new window.Sk.builtin.tuple(groups));
            }
            if (match.index === regex.lastIndex) {
                regex.lastIndex += 1;
            }
        }

        return pos_result;
        // return new window.Sk.builtin.list(match_result);
    };

    constructor() {
        super();

        RegexElement.toolCount += 1;
        // console.log(RegexElement.toolCount);
        this.toolNumber = RegexElement.toolCount;

        this.root = this.attachShadow({ mode: 'open' });

        window.Sk.configure({
            output: this.outf,
            read: this.builtinRead
        });

        // time limit for running each run
        window.Sk.execLimit = 1000;

        // add style
        this.addStyle();

        // init element: button for unittest
        // const unitTestButton = document.createElement('button');
        // unitTestButton.innerText = 'Run Unit Test';
        // this.root.appendChild(unitTestButton);
        // unitTestButton.onclick = () => this.unitTestTable.check(this.regexInput.getText());

        // TODO: make this an option; for now always enabled the 'always check' for study 0 and 1.
        this.checkWhileTyping = true;

        // a div wrapping the input and the test case status
        const inputAndTestStatusDiv = document.createElement('div');
        this.root.append(inputAndTestStatusDiv);
        inputAndTestStatusDiv.classList.add('regex-input-and-test-status');

        // init regex input based on the input type
        const inputDiv = document.createElement('div');
        inputAndTestStatusDiv.appendChild(inputDiv);
        inputDiv.classList.add('regex-input-div');
        this.regexOptions = new RegexOptions(this);
        this.patternValidFlag = true;
        this._parsonsData = new Array<string>();
        this.parsonsExplanation = null;
        this.regexStatus = new RegexStatusTag(this);
        this.regexInput = new ParsonsInput(this);
        this.inputType = 'parsons';
        // this.regexErrorMessage = document.createElement('div');
        // this.regexErrorPosition = -1;
        this.initRegexInput(inputDiv);

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
        testStringDiv.classList.add('regex-test-string-container');
        this.root.append('Feel free to experiment with your own test cases.');
        this.root.append(testStringDiv);
        const positiveTestStringDiv = document.createElement('div');
        testStringDiv.append(positiveTestStringDiv);
        positiveTestStringDiv.classList.add('regex-test-string-div');
        positiveTestStringDiv.append('Match:');

        this.positiveInitialTestString = '';
        const positiveSlot = document.createElement('slot');
        positiveSlot.name = 'positive-test-string-input'
        positiveTestStringDiv.appendChild(positiveSlot);

        const resetPositiveTestStringButton = document.createElement('button');
        positiveTestStringDiv.appendChild(resetPositiveTestStringButton);
        resetPositiveTestStringButton.innerText = 'Reset'
        resetPositiveTestStringButton.onclick = this.resetPositiveTestString;

        this.positiveTestStringInput = new TestStringInput('positive', this);
        this.positiveTestStringInput.slotName = 'positive';
        this.appendChild(this.positiveTestStringInput.el);
        this.positiveTestStringInput.el.slot = 'positive-test-string-input';
        this.positiveTestStringInput.initQuill();
        this.positivePrevText = this.positiveTestStringInput.getText();
        this.positiveTestStringInput.quill?.on('text-change', (delta, _, source) => {
            if (source == 'user') {
                const testStringInputEvent: RegexEvent.TestStringInputEvent = {
                    'event-type': 'test-string-input',
                    'slot': 'positive',
                    dropped: this.positiveTestStringInput.droppedText,
                    delta: delta,
                    'test-string': this.positiveTestStringInput.getText()
                }
                this.logEvent(testStringInputEvent);
            }
            this.positiveTestStringInput.droppedText = false;
            if (this.positiveTestStringInput.getText() != this.positivePrevText) {
                this.positivePrevText = this.positiveTestStringInput.getText();
                // updating test_string in pyodide
                // window.pyodide.globals.test_string = this.testStringInput.getText().slice(0, -1);
                if (this.checkWhileTyping && this.patternValidFlag) {
                    // this.match();
                    this._match_with_Sk();
                } else {
                    this.positiveTestStringInput.quill?.removeFormat(0, this.positiveTestStringInput.quill.getLength() - 1, 'silent');
                }
            }
        })

        const negativeTestStringDiv = document.createElement('div');
        testStringDiv.append(negativeTestStringDiv);
        negativeTestStringDiv.classList.add('regex-test-string-div');
        negativeTestStringDiv.append('Do not match:');

        this.negativeInitialTestString = '';
        const negativeSlot = document.createElement('slot');
        negativeSlot.name = 'negative-test-string-input'
        negativeTestStringDiv.appendChild(negativeSlot);

        const resetNegativeTestStringButton = document.createElement('button');
        negativeTestStringDiv.appendChild(resetNegativeTestStringButton);
        resetNegativeTestStringButton.innerText = 'Reset'
        resetNegativeTestStringButton.onclick = this.resetNegativeTestString;

        this.negativeTestStringInput = new TestStringInput('negative', this);
        this.negativeTestStringInput.slotName = 'negative';
        this.appendChild(this.negativeTestStringInput.el);
        this.negativeTestStringInput.el.slot = 'negative-test-string-input';
        this.negativeTestStringInput.initQuill();
        this.negativePrevText = this.negativeTestStringInput.getText();
        this.negativeTestStringInput.quill?.on('text-change', (delta, _, source) => {
            if (source == 'user') {
                const testStringInputEvent: RegexEvent.TestStringInputEvent = {
                    'event-type': 'test-string-input',
                    'slot': 'negative',
                    dropped: this.negativeTestStringInput.droppedText,
                    delta: delta,
                    'test-string': this.negativeTestStringInput.getText()
                }
                this.logEvent(testStringInputEvent);
            }
            this.negativeTestStringInput.droppedText = false;
            if (this.negativeTestStringInput.getText() != this.negativePrevText) {
                this.negativePrevText = this.negativeTestStringInput.getText();
                // updating test_string in pyodide
                // window.pyodide.globals.test_string = this.testStringInput.getText().slice(0, -1);
                if (this.checkWhileTyping && this.patternValidFlag) {
                    // this.match();
                    this._match_with_Sk();
                } else {
                    this.negativeTestStringInput.quill?.removeFormat(0, this.negativeTestStringInput.quill.getLength() - 1, 'silent');
                }
            }
        })

        // init element: unit test table
        this.unitTestTable = new UnitTestTable(this);
        this.root.appendChild(this.unitTestTable.el);

        // init element: python output
        this.statusOutput = new StatusOutput(this);
        this.root.appendChild(this.statusOutput.el);

        // initialize the match result array
        this.positiveMatchResult = new Array<Array<MatchGroup>>();
        this.negativeMatchResult = new Array<Array<MatchGroup>>();

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
            // console.log("visibility not working");
        } else {
            const visibilityStatusEvent: RegexEvent.PageVisibilityCapturable = {
                'event-type': 'page-visibility-status',
                enabled: true
            }
            this.logEvent(visibilityStatusEvent);
            // console.log("add visibility change");
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
        this.problemId = this.getAttribute('problem-id') || '';
        // console.log(this.studentId);
        // console.log(this.problemId);

        this.temporaryInputEvent = null;
        this.matchFindall = true;
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


    // TODO[refactor]: put stylesheet in a separate css/scss file
    private addStyle = (): void => {
        const sheet = document.createElement('style');
        sheet.innerHTML += '.regex-textbox {width: 100%; display:none;}\n';
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
        sheet.innerHTML += '.regex-test-string-container {display:flex;}\n';
        sheet.innerHTML += '.regex-test-string-div, .regex-input-div { margin: 8px 0; height: fit-content; }\n';
        sheet.innerHTML += '.regex-test-string-div { flex: 1; }\n';
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
        // TODO: showing the table for now
        // sheet.innerHTML += '.regex-unittest > table, .regex-unittest td {border: 1px solid black; padding: 3px; text-align: center;}\n'
        // sheet.innerHTML += '.regex-unittest.collapse{display:none;}\n'
        // for study 0: hide the table
        sheet.innerHTML += '.hidetests .regex-unittest{display:none;}\n'

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
     * Runs a function similar to re.finditer() with data from regex and test string input.
     * Highlights the result in the test string input.
     */
    // TODO: separate positive and negative test string to prevent additional calculation when test string is changed
    private _match_with_Sk = (): void => {
        let positiveTestString = this.positivePrevText;
        let negativeTestString = this.negativePrevText;
        let regex = this.regexInput.getText();
        if (regex == '') {
            // ignore empty regex
            return;
        }
        // TODO: add flags. defaulted to gm for now
        // something to do with regexOptions
        
        // updates test string highlight
        this.positiveTestStringInput.updateMatchResultNoGroup(this._Sk_finditer(regex, positiveTestString), this.groupColor);
        this.negativeTestStringInput.updateMatchResultNoGroup(this._Sk_finditer(regex, negativeTestString), this.groupColor);

        // TODO: add log
        // the code below is the one for pyodide
        // const positiveMatchTestStringEvent: RegexEvent.MatchTestStringEvent = {
        //     'event-type': 'match',
        //     'slot': 'positive',
        //     trigger: RegexEvent.MatchTriggerType.AUTO,
        //     regex: this.regexInput.getText(),
        //     'test-string': this.positivePrevText,
        //     flags: this.regexOptions.getFlagList(),
        //     "match-result": this.positiveMatchResult
        // }
        // this.logEvent(positiveMatchTestStringEvent);
        // const negativeMatchTestStringEvent: RegexEvent.MatchTestStringEvent = {
        //     'event-type': 'match',
        //     'slot': 'negative',
        //     trigger: RegexEvent.MatchTriggerType.AUTO,
        //     regex: this.regexInput.getText(),
        //     'test-string': this.negativePrevText,
        //     flags: this.regexOptions.getFlagList(),
        //     "match-result": this.negativeMatchResult
        // }
        // this.logEvent(negativeMatchTestStringEvent);
        // negative test strings
    }

    /**
     * Runs re.findall() with data from regex and test string input;
     * Highlights the result in the test string input;
     * Prints python output.
    */
    // public match = (): void => {
    //     this.statusOutput.text.value = ''
    //     let pydata = 'import re\n';
    //     window.pyodide.globals.positive_test_string = this.positivePrevText;
    //     window.pyodide.globals.negative_test_string = this.negativePrevText;
    //     if (this.regexInput.getText() != '') {
    //         window.pyodide.globals.regex_input = this.regexInput.getText();
    //     } else {
    //         return;
    //     }
    //     if (this.regexOptions.getFlags() != null) {
    //         pydata += 'pattern = re.compile(regex_input, ' + this.regexOptions.getFlags() + ')\n';
    //     } else {
    //         pydata += 'pattern = re.compile(regex_input)\n';
    //     }
    //     pydata += 'source = positive_test_string\n';
    //     pydata += 'global positive_match_result\n';
    //     pydata += 'positive_match_result = []\n';
    //     // TODO: (performance)try to reduce assigning data here
    //     pydata += 'for match_obj in re.finditer(pattern, source):\n';
    //     pydata += '    match_data = []\n';
    //     pydata += '    positive_match_result.append(match_data)\n';
    //     pydata += '    for group_id in range(pattern.groups + 1):\n';
    //     pydata += '        group_data = {}\n';
    //     pydata += '        match_data.append(group_data)\n';
    //     pydata += '        group_data[\'group_id\'] = group_id\n';
    //     pydata += '        group_data[\'start\'] = match_obj.start(group_id)\n';
    //     pydata += '        group_data[\'end\'] = match_obj.end(group_id)\n';
    //     pydata += '        group_data[\'data\'] = match_obj.group(group_id)\n';
    //     pydata += '    for name, index in pattern.groupindex.items():\n';
    //     pydata += '        match_data[index][\'name\'] = name\n';
    //     pydata += 'source = negative_test_string\n';
    //     pydata += 'global negative_match_result\n';
    //     pydata += 'negative_match_result = []\n';
    //     // TODO: (performance)try to reduce assigning data here
    //     pydata += 'for match_obj in re.finditer(pattern, source):\n';
    //     pydata += '    match_data = []\n';
    //     pydata += '    negative_match_result.append(match_data)\n';
    //     pydata += '    for group_id in range(pattern.groups + 1):\n';
    //     pydata += '        group_data = {}\n';
    //     pydata += '        match_data.append(group_data)\n';
    //     pydata += '        group_data[\'group_id\'] = group_id\n';
    //     pydata += '        group_data[\'start\'] = match_obj.start(group_id)\n';
    //     pydata += '        group_data[\'end\'] = match_obj.end(group_id)\n';
    //     pydata += '        group_data[\'data\'] = match_obj.group(group_id)\n';
    //     pydata += '    for name, index in pattern.groupindex.items():\n';
    //     pydata += '        match_data[index][\'name\'] = name\n';
    //     window.pyodide.runPythonAsync(pydata)
    //         .then(_ => {
    //             // TODO: (robustness)test edge cases with no match
    //             this.positiveMatchResult = window.pyodide.globals.positive_match_result as Array<Array<MatchGroup>>;
    //             this.negativeMatchResult = window.pyodide.globals.negative_match_result as Array<Array<MatchGroup>>;
    //             this.addMatchResultToOutput();
    //             // TODO: (feature)fix highlighting with group information
    //             this.positiveTestStringInput.updateGroupedMatchResult(this.positiveMatchResult, this.groupColor);
    //             this.negativeTestStringInput.updateGroupedMatchResult(this.negativeMatchResult, this.groupColor);
    //             // this.testStringInput.updateGroupedMatchResult_exp(this.matchResult);
    //             // log match result
    //             // TODO: it is always auto in this study, but could change in other studies
    //             const positiveMatchTestStringEvent: RegexEvent.MatchTestStringEvent = {
    //                 'event-type': 'match',
    //                 'slot': 'positive',
    //                 trigger: RegexEvent.MatchTriggerType.AUTO,
    //                 regex: this.regexInput.getText(),
    //                 'test-string': this.positivePrevText,
    //                 flags: this.regexOptions.getFlagList(),
    //                 "match-result": this.positiveMatchResult
    //             }
    //             this.logEvent(positiveMatchTestStringEvent);
    //             const negativeMatchTestStringEvent: RegexEvent.MatchTestStringEvent = {
    //                 'event-type': 'match',
    //                 'slot': 'negative',
    //                 trigger: RegexEvent.MatchTriggerType.AUTO,
    //                 regex: this.regexInput.getText(),
    //                 'test-string': this.negativePrevText,
    //                 flags: this.regexOptions.getFlagList(),
    //                 "match-result": this.negativeMatchResult
    //             }
    //             this.logEvent(negativeMatchTestStringEvent);
    //         })
    //         .catch((err) => { this.addTextToOutput(err) });
    // }

    private _compilePattern_Sk = (): boolean => {
        let regex = this.regexInput.getText();
        if (regex == '') {
            // this.regexErrorMessage.classList.add('hidden');
            return false;
        }
        try {
            new RegExp(regex);
            return true;
        } catch (e) {
            console.log(e)
            return false;
        }
    }

    // /**
    //  * Runs re.compile() without flags
    // */
    // public pyodide_compilePattern = (): boolean => {
    //     // console.log('compile')
    //     if (this.regexInput.getText() == '') {
    //         this.regexErrorMessage.classList.add('hidden');
    //         return false;
    //     }
    //     this.statusOutput.text.value = ''
    //     let pydata = 'import re\n';
    //     window.pyodide.globals.regex_input = this.regexInput.getText();
    //     pydata += 'compiled_pattern = re.compile(regex_input)\n';
    //     let successFlag = false;
    //     try {
    //         window.pyodide.runPython(pydata);
    //         successFlag = true;
    //         this.regexErrorMessage.classList.add('hidden');
    //         this.regexErrorMessage.innerText = 'No Error';
    //         this.regexErrorPosition = -1;
    //     } catch (err) {
    //         successFlag = false;
    //         // updates error message
    //         const regexError = String(err).split('\n');
    //         const errorMessage = regexError[regexError.length - 2];
    //         const errorMessageSplit = errorMessage.split(' ');
    //         this.regexErrorPosition = parseInt(errorMessageSplit[errorMessageSplit.length - 1]);
    //         this.regexErrorMessage.innerText = errorMessage;
    //         if (this.regexErrorMessage.classList.contains('hidden')) {
    //             this.regexErrorMessage.classList.remove('hidden');
    //         }
    //     }
    //     return successFlag;
    // }

    // private addToOutput = (originalOutput: Array<string | Array<string>>): void => {
    //     let output = '';
    //     originalOutput.forEach(element => {
    //         output += '(' + element.toString() + '),';
    //     });
    //     this.statusOutput.text.value += '>>>' + this.regexInput.getText() + '\n' + output + '\n';
    // }

    // private addTextToOutput = (output: string): void => {
    //     this.statusOutput.text.value += '>>>' + this.regexInput.getText() + '\n' + output + '\n';
    // }

    // private addMatchResultToOutput = (): void => {
    //     let output = '';
    //     // currently disabling output
    //     // for (let i = 0; i < this.matchResult.length; ++i) {
    //     //     output += 'Match ' + i.toString() + ':\n';
    //     //     for (let j = 0; j < this.matchResult[i].length; ++j) {
    //     //         output += 'Group ' + j.toString() + ': ';
    //     //         output += this.matchResult[i][j].data + ' span(' + this.matchResult[i][j].start + ', ' + this.matchResult[i][j].end + ') ';
    //     //         if (this.matchResult[i][j].name) {
    //     //             output += this.matchResult[i][j].name;
    //     //         }
    //     //         output += '\n';
    //     //     }
    //     //     output += '\n';
    //     // }
    //     // this.statusOutput.text.value += '>>>\n' + output;
    // }

    public setPositiveInitialTestString(text: string) {
        this.positiveTestStringInput.setText(text);
        this.positiveInitialTestString = text;
    }

    public setNegativeInitialTestString(text: string) {
        this.negativeTestStringInput.setText(text);
        this.negativeInitialTestString = text;
    }

    public setTestCases(testCases: Array<TestCase>) {
        console.log('set test cases');
        this.unitTestTable.setTestCases(testCases);
    }

    private resetPositiveTestString = (): void => {
        const testStringResetEvent: RegexEvent.TestStringResetEvent = {
            'event-type': 'test-string-reset',
            'slot': 'positive',
            'test-string': this.positiveInitialTestString
        };
        this.logEvent(testStringResetEvent);
        this.positiveTestStringInput.setText(this.positiveInitialTestString);
    }

    private resetNegativeTestString = (): void => {
        const testStringResetEvent: RegexEvent.TestStringResetEvent = {
            'event-type': 'test-string-reset',
            'slot': 'negative',
            'test-string': this.negativeInitialTestString
        };
        this.logEvent(testStringResetEvent);
        this.negativeTestStringInput.setText(this.negativeInitialTestString);
    }

    public logEvent = (eventContent: any): void => {
        const basicEvent: RegexEvent.BasicEvent = {
            'student-id': window.regexStudentId || 'stub-id',
            'course-id': window.regexCourseId || 'stub-course-id',
            'problem-id': this.problemId,
            'input-type': this.inputType,
            'client-timestamp': this._getTimestamp()
        };
        const ev = new CustomEvent('regex-element', {bubbles: true, detail: {...basicEvent, ...eventContent}});
        this.dispatchEvent(ev);
        // console.log({...basicEvent, ...eventContent});
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
            // regexInputEvent['error-message'] = this.regexErrorMessage.innerText;
        }
        this.logEvent(regexInputEvent);
    }

    private _getStudentIdFromURL = (): string => {
        const queryString = document.location.search;
        const urlParams = new URLSearchParams(queryString);
        const studentId = urlParams.get('student-id') || 'stub-student-id';
        return studentId;
    }

    public logCognitiveLoad = (cl: number): void => {
        const cognitiveLoad: RegexEvent.CognitiveLoad = {
            'event-type': 'cognitive-load',
            'data': cl
        };
        this.logEvent(cognitiveLoad);
    }

    public logProblemFinished = (completed: boolean): void => {
        const problemFinished: RegexEvent.ProblemFinished = {
            'event-type': 'problem-finished',
            'completed': completed
        };
        this.logEvent(problemFinished);
    }

    static get observedAttributes() { return ['input-type', 'problem-id', 'hidetests']; }

    attributeChangedCallback(name: string, oldValue: any, newValue: any) {
        switch (name) {
            case 'input-type': {
                this.initRegexInput(this.root.querySelector('.regex-input-div') as HTMLDivElement);
                break;
            }
            case 'problem-id': {
                this.problemId = newValue;
                break;
            }
            case 'hidetests': {
                if (newValue) {
                    this.unitTestTable.el.style.display = 'none';
                } else {
                    this.unitTestTable.el.style.display = 'block';
                }
            }
        }
    }

    private initRegexInput(inputDiv: HTMLDivElement) {
        inputDiv.innerHTML = '';
        this.patternValidFlag = true;
        let inputType = this.getAttribute('input-type');
        this.inputType = inputType == 'parsons' ? 'parsons' : 'text';
        this._parsonsData = new Array<string>();
        this.parsonsExplanation = null;
        inputDiv.append('Your regular expression:');
        this.regexStatus = new RegexStatusTag(this);
        inputDiv.appendChild(this.regexStatus.el);
        inputDiv.appendChild(document.createElement('br'));
        // todo:(UI) fix the css for the input
        if (this.inputType == 'parsons') {
            // init elements: parsons regex input
            this.regexInput = new ParsonsInput(this);
            inputDiv.appendChild(this.regexInput.el);
            this.regexInput.el.addEventListener('regexChanged', () => {
                this.regexInput.removeFormat();
                if (this.checkWhileTyping) {
                    // this.patternValidFlag = this.pyodide_compilePattern();
                    this.patternValidFlag = this._compilePattern_Sk();
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
                        // this.match();
                        this._match_with_Sk();
                        if (passCount === this.unitTestTable.testCaseCount) {
                            // console.log('dispatch');
                            this.dispatchEvent(new CustomEvent('passed-all-testcases'));
                        }
                    } else {
                        // if (this.regexErrorMessage.classList.contains('hidden')) {
                        //     // it means the regex is actually empty
                        //     this.regexStatus.updateStatus('');
                        // } else {
                        //     this.regexStatus.updateStatus('error');
                        //     this.regexInput.updateTestStatus('Error');
                        //     this.regexInput.highlightError(this.regexErrorPosition);
                        //     // console.log('highlight error: ');
                        //     // console.log(this.regexErrorPosition);
                        // }
                        if (this.regexInput.getText() == '') {
                            this.regexStatus.updateStatus('');
                            this.unitTestTable.check('');
                        } else {
                            this.regexStatus.updateStatus('error');
                            this.regexInput.updateTestStatus('Error');
                            this.unitTestTable.setError();
                            // this.regexInput.highlightError(this.regexErrorPosition);
                            // console.log('highlight error: ');
                            // console.log(this.regexErrorPosition);
                        }
                        this.positiveTestStringInput.quill?.removeFormat(0, this.positiveTestStringInput.quill.getLength() - 1, 'silent');
                        this.negativeTestStringInput.quill?.removeFormat(0, this.negativeTestStringInput.quill.getLength() - 1, 'silent');
                        this._testStatusDiv.innerText = 'Test cases passed: 0/' + this.unitTestTable.testCaseCount;
                    }
                }
            }, false)
        } else {
            // (this.inputType == 'text')
            const regex_slot = document.createElement('slot');
            regex_slot.name = 'regex-input'
            inputDiv.appendChild(regex_slot);
            // TODO: (refactor) rename RegexInput
            this.regexInput = new TextInput(this);
            this.appendChild(this.regexInput.el);
            this.regexInput.el.slot = 'regex-input';
            (this.regexInput as TextInput).initQuill();
            (this.regexInput as TextInput).quill?.on('text-change', (delta) => {
                (this.regexInput as TextInput).removeFormat();
                // logging free input event
                this.temporaryInputEvent = {
                    'event-type': 'text-input',
                    dropped: (this.regexInput as TextInput).droppedText,
                    delta: delta,
                    answer: this.regexInput.getText()
                };
                (this.regexInput as TextInput).droppedText = false;
                // update status indicator
                // this.patternValidFlag = this.pyodide_compilePattern();
                this.patternValidFlag = this._compilePattern_Sk();
                if (this.patternValidFlag) {
                    this.regexStatus.updateStatus('valid');
                } else {
                    this.regexStatus.updateStatus('error');
                    // this.regexInput.highlightError(this.regexErrorPosition);
                }
                // console.log(this.patternValidFlag);
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
                        // this.match();
                        this._match_with_Sk();
                        if (passCount === this.unitTestTable.testCaseCount) {
                            // console.log('dispatch');
                            this.dispatchEvent(new CustomEvent('passed-all-testcases'));
                        }
                    } else {
                        // if (this.regexErrorMessage.classList.contains('hidden')) {
                        if (this.regexInput.getText() == '') {
                            // it means the regex is actually empty
                            this.regexStatus.updateStatus('');
                            this.unitTestTable.check('');
                        } else {
                            this.regexStatus.updateStatus('error');
                            this.regexInput.updateTestStatus('Error');
                            this.unitTestTable.setError();
                            // this.regexInput.highlightError(this.regexErrorPosition);
                        }
                        this.positiveTestStringInput.quill?.removeFormat(0, this.positiveTestStringInput.quill.getLength() - 1, 'silent');
                        this.negativeTestStringInput.quill?.removeFormat(0, this.negativeTestStringInput.quill.getLength() - 1, 'silent');
                        this._testStatusDiv.innerText = 'Test cases passed: 0/' + this.unitTestTable.testCaseCount;
                    }
                    // check and update the background color of the parsons input based on the unit test results
                }
            })
        }
        // this.regexErrorMessage = document.createElement('div');
        // this.regexErrorMessage.classList.add('regex-error-message');
        // inputDiv.appendChild(this.regexErrorMessage);
        // this.regexErrorPosition = -1;

        // init elements: regex options dropdown
        this.regexOptions = new RegexOptions(this);
        // inputDiv.appendChild(this.regexOptions.el);

    }

    public resetTool() {
        if (this.inputType != 'parsons') {
            const regexInput = this.regexInput as TextInput;
            regexInput.quill?.setText('', 'silent');
        }
        // this.regexErrorMessage.classList.add('hidden');
        this.regexStatus.updateStatus('');
        this.positiveTestStringInput.quill?.removeFormat(0, this.positiveTestStringInput.quill.getLength() - 1, 'silent');
        this.negativeTestStringInput.quill?.removeFormat(0, this.negativeTestStringInput.quill.getLength() - 1, 'silent');
        this._testStatusDiv.innerText = '';
        this.unitTestTable.setError();
    }

    // restore student answer from outside storage
    public restoreAnswer(type: string | undefined, answer: string | Array<string> | undefined) {
        if (type == undefined || answer == undefined) {
            return;
        }
        this.regexInput.restoreAnswer(type, answer);
    }
}

customElements.define('regex-element', RegexElement);
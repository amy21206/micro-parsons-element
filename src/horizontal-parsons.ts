import { ParsonsInput } from './ParsonsInput';
import { TextInput } from './TextInput';
import { RegexEvent } from './LoggingEvents';

// declare global {
//     interface Window {
//         languagePluginUrl: string
//         Sk: Skulpt
//         regexStudentId: string
//         regexCourseId: string
//     }
// }

export class HParsonsElement extends HTMLElement {

    private root: ShadowRoot;

    private _parsonsData: Array<string>;
    public parsonsExplanation: Array<string> | null;
    public hparsonsInput: IHParsonsInput;
    private inputType: string;

    public static toolCount: number = 0;

    public toolNumber: number;

    public temporaryInputEvent: any;


    constructor() {
        super();

        HParsonsElement.toolCount += 1;
        // console.log(RegexElement.toolCount);
        this.toolNumber = HParsonsElement.toolCount;

        this.root = this.attachShadow({ mode: 'open' });

        this.hparsonsInput = new ParsonsInput(this);
        // add style
        this.addStyle();

        // a div wrapping the input and the test case status
        // init regex input based on the input type
        this._parsonsData = new Array<string>();
        this.parsonsExplanation = null;
        this.inputType = 'parsons';
        // this.regexErrorMessage = document.createElement('div');
        // this.regexErrorPosition = -1;
        this.initRegexInput();
        this.temporaryInputEvent = {};
    }

    set parsonsData(data: Array<string>) {
        this._parsonsData = data;
        if (this.inputType == 'parsons') {
            (this.hparsonsInput as ParsonsInput).setSourceBlocks(data, this.parsonsExplanation);
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

    public logEvent = (eventContent: any): void => {
        console.log('hparsons, logevent')
        // const basicEvent: RegexEvent.BasicEvent = {
        //     'student-id': window.regexStudentId || 'stub-id',
        //     'course-id': window.regexCourseId || 'stub-course-id',
        //     'problem-id': this.problemId,
        //     'input-type': this.inputType,
        //     'client-timestamp': this._getTimestamp()
        // };
        // const ev = new CustomEvent('regex-element', {bubbles: true, detail: {...basicEvent, ...eventContent}});
        // this.dispatchEvent(ev);
        // // console.log({...basicEvent, ...eventContent});
    }

    // private _getTimestamp = (): string => {
    //     const timestamp = new Date();
    //     return timestamp.getFullYear() + '/' + (timestamp.getMonth() + 1) + '/' + timestamp.getDate() + '/' + timestamp.getHours() + '/' + timestamp.getMinutes() + '/' + timestamp.getSeconds() + '/' + timestamp.getMilliseconds();
    // }

    // // log regex input event along with compilation result
    // private _logRegexInputEvent = (): void => {
    //     // TODO: just using any here. but regexInputEvent is actually RegexEvent.ParsonsInputEvent or FreeInputEvent... so much trouble with typing!!
    //     let regexInputEvent: any = {
    //         ...this.temporaryInputEvent,
    //         valid: this.patternValidFlag
    //     };
    //     if (!this.patternValidFlag) {
    //         // regexInputEvent['error-message'] = this.regexErrorMessage.innerText;
    //     }
    //     this.logEvent(regexInputEvent);
    // }

    static get observedAttributes() { return ['input-type']; }

    attributeChangedCallback(name: string, oldValue: any, newValue: any) {
        switch (name) {
            case 'input-type': {
                this.initRegexInput();
                break;
            }
        }
    }

    private initRegexInput() {
        this.root.innerHTML = '';
        let inputType = this.getAttribute('input-type');
        this.inputType = inputType == 'parsons' ? 'parsons' : 'text';
        this._parsonsData = new Array<string>();
        this.parsonsExplanation = null;
        // todo:(UI) fix the css for the input
        if (this.inputType == 'parsons') {
            // init elements: parsons regex input
            this.hparsonsInput = new ParsonsInput(this);
            this.root.appendChild(this.hparsonsInput.el);
        } else {
            // (this.inputType == 'text')
            const regex_slot = document.createElement('slot');
            regex_slot.name = 'regex-input'
            this.root.appendChild(regex_slot);
            // TODO: (refactor) rename RegexInput
            this.hparsonsInput = new TextInput(this);
            this.appendChild(this.hparsonsInput.el);
            this.hparsonsInput.el.slot = 'regex-input';
            (this.hparsonsInput as TextInput).initQuill();
            (this.hparsonsInput as TextInput).quill?.on('text-change', (delta) => {
                (this.hparsonsInput as TextInput).removeFormat();
                // logging free input event
                this.temporaryInputEvent = {
                    'event-type': 'text-input',
                    dropped: (this.hparsonsInput as TextInput).droppedText,
                    delta: delta,
                    answer: this.hparsonsInput.getText()
                };
                (this.hparsonsInput as TextInput).droppedText = false;
                // this._logRegexInputEvent();
            })
        }
    }

    public resetTool() {
        if (this.inputType != 'parsons') {
            const regexInput = this.hparsonsInput as TextInput;
            regexInput.quill?.setText('', 'silent');
        }
    }

    // restore student answer from outside storage
    public restoreAnswer(type: string | undefined, answer: string | Array<string> | undefined) {
        if (type == undefined || answer == undefined) {
            return;
        }
        this.hparsonsInput.restoreAnswer(type, answer);
    }

    public getCurrentInput() {
        return this.hparsonsInput.getText();
    }

    public getParsonsTextArray() {
        return (this.hparsonsInput as ParsonsInput)._getTextArray();
    }
}

customElements.define('horizontal-parsons', HParsonsElement);
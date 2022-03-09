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

    public inputDiv: HTMLDivElement;

    constructor() {
        super();

        HParsonsElement.toolCount += 1;
        // console.log(RegexElement.toolCount);
        this.toolNumber = HParsonsElement.toolCount;

        this.root = this.attachShadow({ mode: 'open' });

        this.addStyle();
        this.inputDiv = document.createElement('div');
        this.inputDiv.classList.add('hparsons-input');
        this.root.append(this.inputDiv)
        this.hparsonsInput = new ParsonsInput(this);

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
        // parsons block
        sheet.innerHTML += '.hparsons-input {padding: 15px;}\n';
        sheet.innerHTML += '.hparsons-tip { font-style: italic; }\n';
        sheet.innerHTML += '.parsons-block {display: inline-block; font-family: monospace; border-color:gray; margin: 0 1px; position: relative; border-radius: 10px; background-color: #efefef; border: 1px solid #d3d3d3; padding: 5px 10px; margin-top: 5px;}\n';
        sheet.innerHTML += '.parsons-block:hover, .parsons-block:focus { border-color: black;}\n';
        sheet.innerHTML += '.drop-area { background-color: #ffa; padding: 0 5px; height: 42px; }\n';
        // TODO:(UI) move the tooltip to the top of the line
        sheet.innerHTML += '.parsons-block .tooltip { visibility: hidden; width: 200px;  background-color: black; color: #fff; text-align: center; padding: 5px 0; border-radius: 6px;  position: absolute; z-index: 1; margin: 0 10px; bottom: 120%; margin-left: -100px;}\n';
        sheet.innerHTML += '.parsons-block .tooltip::after {content: " ";position: absolute; top: 100%;left: 50%; margin-left: -5px; border-width: 5px; border-style: solid; border-color: black transparent transparent transparent;}\n';
        sheet.innerHTML += '.drag-area .parsons-block:hover .tooltip { visibility: visible;}\n';
        sheet.innerHTML += '.drag-area { background-color: #efefff; padding: 0 5px; height: 42px; }\n';
        // unittest

        this.root.appendChild(sheet);

        const global_sheet = document.createElement('style');
        global_sheet.innerHTML += '.regex-input .ql-editor {height: fit-content;}\n';
        global_sheet.innerHTML += '.ql-editor { box-shadow: 0 0 2px 5px #b1dafa; margin: 5px; }\n';
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
        this.inputDiv.innerHTML = '';
        let inputType = this.getAttribute('input-type');
        this.inputType = inputType == 'parsons' ? 'parsons' : 'text';
        this._parsonsData = new Array<string>();
        this.parsonsExplanation = null;
        // todo:(UI) fix the css for the input
        if (this.inputType == 'parsons') {
            // init elements: parsons regex input
            this.hparsonsInput = new ParsonsInput(this);
            this.inputDiv.appendChild(this.hparsonsInput.el);
        } else {
            // (this.inputType == 'text')
            const regex_slot = document.createElement('slot');
            regex_slot.name = 'regex-input'
            this.inputDiv.appendChild(regex_slot);
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
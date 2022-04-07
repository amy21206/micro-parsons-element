import { ParsonsInput } from './ParsonsInput';
import { TextInput } from './TextInput';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import sql from 'highlight.js/lib/languages/sql';
import xml from 'highlight.js/lib/languages/xml';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('java', java);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('python', python);

export class HParsonsElement extends HTMLElement {

    private root: HTMLElement;

    private _parsonsData: Array<string>;
    public parsonsExplanation: Array<string> | null;
    public hparsonsInput: IHParsonsInput;
    private inputType: string;

    public static toolCount: number = 0;

    public toolNumber: number;

    public temporaryInputEvent: any;

    public inputDiv: HTMLDivElement;

    public language: string|undefined;

    private contextBefore: HTMLDivElement | null;
    private contextAfter: HTMLDivElement | null;

    constructor() {
        super();

        HParsonsElement.toolCount += 1;
        // console.log(RegexElement.toolCount);
        this.toolNumber = HParsonsElement.toolCount;

        // this.root = this.attachShadow({ mode: 'open' });
        this.root = this;

        this.addStyle();
        this.inputDiv = document.createElement('div');
        this.inputDiv.classList.add('hparsons-input');
        this.root.append(this.inputDiv)
        const reusable = this.getAttribute('reuse-blocks') ? true : false;
        const randomize = this.getAttribute('randomize') ? true : false;
        this.hparsonsInput = new ParsonsInput(this, reusable, randomize);
        // console.log(reusable)

        // a div wrapping the input and the test case status
        // init regex input based on the input type
        this._parsonsData = new Array<string>();
        this.parsonsExplanation = null;
        this.inputType = 'parsons';
        // this.regexErrorMessage = document.createElement('div');
        // this.regexErrorPosition = -1;
        this.initRegexInput();
        this.temporaryInputEvent = {};

        let languageMap = new Map(Object.entries({
            'html': 'xml',
            'python': 'python',
            'javascript': 'javascript',
            'java': 'java',
            'sql': 'sql'
        }));
        this.language = languageMap.get(this.getAttribute('language') || 'none');

        this.contextBefore = this.contextAfter = null;
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
        sheet.innerHTML += '.drop-area .parsons-block.incorrectPosition {background-color: #ffbaba; border: 1px solid red;}\n';
        sheet.innerHTML += '.parsons-block:hover, .parsons-block:focus { border-color: black;}\n';
        sheet.innerHTML += '.drop-area { background-color: #ffa; padding: 0 5px; height: 42px; margin: 2px 0;}\n';
        sheet.innerHTML += '.drop-area.incorrect { background-color: #f2dede; border-color: #f2b6b6}\n';
        sheet.innerHTML += '.drop-area.correct { background-color: #dff0d8; border-color: #ade595}\n';
        // TODO:(UI) move the tooltip to the top of the line
        sheet.innerHTML += '.parsons-block .tooltip { visibility: hidden; width: 200px;  background-color: black; color: #fff; text-align: center; padding: 5px 0; border-radius: 6px;  position: absolute; z-index: 1; margin: 0 10px; bottom: 120%; margin-left: -100px;}\n';
        sheet.innerHTML += '.parsons-block .tooltip::after {content: " ";position: absolute; top: 100%;left: 50%; margin-left: -5px; border-width: 5px; border-style: solid; border-color: black transparent transparent transparent;}\n';
        sheet.innerHTML += '.drag-area .parsons-block:hover .tooltip { visibility: visible;}\n';
        sheet.innerHTML += '.drag-area { background-color: #efefff; padding: 0 5px; height: 42px; margin: 2px 0; }\n';
        sheet.innerHTML += '.context.hide {display: none;}\n';
        sheet.innerHTML += '.context {padding: 0 4px; background-color: #eea; font-family: monospace;}\n';
        // unittest

        this.root.appendChild(sheet);

        const global_sheet = document.createElement('style');
        global_sheet.innerHTML += '.regex-input .ql-editor {height: fit-content;}\n';
        global_sheet.innerHTML += '.ql-editor { box-shadow: 0 0 2px 5px #b1dafa; margin: 5px; }\n';
        this.appendChild(global_sheet);
    }

    public logEvent = (eventContent: any): void => {
        // TODO: fix the logging scheme for horizontal parsons in general.
        // Right now it only dispatches event of moving parsons blocks.
        const basicEvent = {
            'input-type': this.inputType,
        };
        const ev = new CustomEvent('horizontal-parsons', {bubbles: true, detail: {...basicEvent, ...eventContent}});
        this.dispatchEvent(ev);
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
            const reusable = this.getAttribute('reuse-blocks') != null ? true : false;
            const randomize = this.getAttribute('randomize') != null ? true : false;
            this.hparsonsInput = new ParsonsInput(this, reusable, randomize);
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

    public resetInput() {
        if (this.inputType != 'parsons') {
            const regexInput = this.hparsonsInput as TextInput;
            regexInput.quill?.setText('', 'silent');
        } else if (this.inputType == 'parsons') {
            (this.hparsonsInput as ParsonsInput).resetInput();
        }
        const resetEvent = {
            'event-type': 'reset',
        };
        this.logEvent(resetEvent);
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

    public setContext = (context: Array<string>): void => {
        const contextBefore = this.querySelector('#hparsons-' + this.toolNumber + '-context-before') as HTMLDivElement;
        const contextAfter = this.querySelector('#hparsons-' + this.toolNumber + '-context-after') as HTMLDivElement;
        let codeIndex = -1;
        let indent = 0;
        for (let i = 0; i < context.length; ++i) {
            indent = context[i].indexOf('****');
            if (indent != -1) {
                codeIndex = i;
                break;
            }
        }
        if (this.language) {
            contextBefore.innerHTML = hljs.highlight(context.slice(0, codeIndex).join('\n'), {language: this.language, ignoreIllegals: true}).value
            contextAfter.innerHTML = hljs.highlight(context.slice(codeIndex + 1).join('\n'), {language: this.language, ignoreIllegals: true}).value
        } else {
            contextBefore.innerText = context.slice(0, codeIndex).join('\n');
            contextAfter.innerText = context.slice(codeIndex + 1).join('\n');
        }
        contextBefore.classList.remove('hide')
        contextAfter.classList.remove('hide')
        if (indent) {
            this.hparsonsInput.setIndent(indent);
            console.log('indent:')
            console.log(indent)
        }
    }
}

customElements.define('horizontal-parsons', HParsonsElement);
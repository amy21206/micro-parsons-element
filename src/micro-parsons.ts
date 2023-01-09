import { MicroParsonsEvent } from './LoggingEvents';
import { ParsonsInput } from './ParsonsInput';

export class HParsonsElement extends HTMLElement {

    private root: HTMLElement;

    private _parsonsData: Array<string>;
    public parsonsExplanation: Array<string> | null;
    public hparsonsInput: IHParsonsInput;
    private inputType: string;

    public static toolCount: number = 0;

    public toolNumber: number;

    public temporaryInputEvent: MicroParsonsEvent.Input|null;

    public language: string;

    constructor() {
        super();

        HParsonsElement.toolCount += 1;
        this.toolNumber = HParsonsElement.toolCount;

        this.root = this;

        this.addStyle();
        const reusable = this.getAttribute('reuse-blocks') ? true : false;
        const randomize = this.getAttribute('randomize') ? true : false;
        this.hparsonsInput = new ParsonsInput(this, reusable, randomize);

        // a div wrapping the input and the test case status
        // init regex input based on the input type
        this._parsonsData = new Array<string>();
        this.parsonsExplanation = null;
        this.inputType = 'parsons';
        this.language = this.getAttribute('language') || 'none';
        this.initInput();
        this.temporaryInputEvent = null;

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
        sheet.innerHTML += '.parsons-tooltip{ visibility: hidden; max-width: 120px; width: max-content; background-color: black; color: #fff; text-align: center; border-radius: 6px; padding: 5px; position: absolute; z-index: 1; top: 30px;}\n';
        sheet.innerHTML += '.parsons-block:hover .parsons-tooltip{ visibility: visible;}\n';
        sheet.innerHTML += '.parsons-block {display: inline-block; font-family: monospace; border-color:gray; margin: 0 1px; position: relative; border-radius: 10px; background-color: #efefef; border: 1px solid #d3d3d3; padding: 5px 10px; margin-top: 5px;}\n';
        sheet.innerHTML += '.drop-area .parsons-block.incorrectPosition {background-color: #ffbaba; border: 1px solid red;}\n';
        sheet.innerHTML += '.parsons-block:hover, .parsons-block:focus { border-color: black;}\n';
        sheet.innerHTML += '.drop-area { background-color: #ffa; padding: 0 5px 5px 5px; min-height: 32px; height: auto; margin: 2px 0;}\n';
        sheet.innerHTML += '.drop-area.incorrect { background-color: #f2dede; border-color: #f2b6b6}\n';
        sheet.innerHTML += '.drop-area.correct { background-color: #dff0d8; border-color: #ade595}\n';
        // TODO:(UI) move the tooltip to the top of the line
        // sheet.innerHTML += '.parsons-block .tooltip { visibility: hidden; width: 200px;  background-color: black; color: #fff; text-align: center; padding: 5px; border-radius: 6px;  position: absolute; z-index: 1; margin: 0 10px; bottom: 120%; margin-left: -100px;}\n';
        // sheet.innerHTML += '.parsons-block .tooltip::after {content: " ";position: absolute; top: 100%;left: 50%; margin-left: -5px; border-width: 5px; border-style: solid; border-color: black transparent transparent transparent;}\n';
        sheet.innerHTML += '.drag-area .parsons-block:hover .tooltip { visibility: visible;}\n';
        sheet.innerHTML += '.drag-area { background-color: #efefff; padding: 0 5px 5px 5px; min-height: 32px; height: auto; margin: 2px 0; }\n';

        this.root.appendChild(sheet);
    }

    public logEvent = (eventContent: any): void => {
        const ev = new CustomEvent('micro-parsons', {bubbles: true, detail: {...eventContent}});
        this.dispatchEvent(ev);
    }

    private initInput() {
        // the only mode supporting is parsons right now; removed the text entry mode
        this.inputType = 'parsons';
        this._parsonsData = new Array<string>();
        this.parsonsExplanation = null;
        const reusable = this.getAttribute('reuse-blocks') != null ? true : false;
        const randomize = this.getAttribute('randomize') != null ? true : false;
        this.hparsonsInput = new ParsonsInput(this, reusable, randomize);
        this.root.appendChild(this.hparsonsInput.el);
    }

    public resetInput() {
        (this.hparsonsInput as ParsonsInput).resetInput();
        const resetEvent:MicroParsonsEvent.Reset = {
            'type': 'reset',
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

    public getCurrentInput(addSpace: boolean) {
        return this.hparsonsInput.getText(addSpace);
    }

    public getParsonsTextArray() {
        return (this.hparsonsInput as ParsonsInput)._getTextArray();
    }
}

customElements.define('micro-parsons', HParsonsElement);
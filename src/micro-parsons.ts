import { MicroParsonsEvent } from './LoggingEvents';
import { ParsonsInput } from './ParsonsInput';
import './style/style.css';

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
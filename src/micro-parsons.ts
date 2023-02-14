import { MicroParsonsEvent } from './LoggingEvents';
import { ParsonsInput } from './ParsonsInput';
import './style/style.css';

export class MicroParsonsElement extends HTMLElement {

    private root: HTMLElement;

    private _parsonsData: Array<string>;
    public parsonsExplanation: Array<string> | null;
    public hparsonsInput: IParsonsInput;
    private inputType: string;

    public static toolCount: number = 0;

    public toolNumber: number;

    public temporaryInputEvent: MicroParsonsEvent.Input|null;

    public language: string;

    constructor() {
        super();

        MicroParsonsElement.toolCount += 1;
        this.toolNumber = MicroParsonsElement.toolCount;

        this.root = this;

        const reusable = this.getAttribute('reuse') ? true : false;
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
        const reusable = this.getAttribute('reuse') != null ? true : false;
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
    public restoreAnswer(answer: Array<string>) {
        this.hparsonsInput.restoreAnswer(answer);
    }

    public getCurrentInput(addSpace: boolean) {
        return this.hparsonsInput.getText(addSpace);
    }

    public getParsonsTextArray() {
        return (this.hparsonsInput as ParsonsInput)._getTextArray();
    }
}

export const InitMicroParsons = (props: MicroParsonsProps) => {
    let parentElem: HTMLElement | null;
    try {
        parentElem = document.querySelector(props.selector);
    } catch {
        throw('micro-parsons: init: selector error');
    }
    if (parentElem == null || parentElem.tagName != 'DIV') {
        throw('micro-parsons: element not a div');
    }
    // TODO: add text support
    const language = ['javascript', 'sql', 'java', 'html', 'python'].indexOf(props.language || '') == -1 ? '' : `language='${props.language}'`;
    const id = props.id ? `id='${props.id}'` : ''
    const innerHTML = `<micro-parsons ${props.reuse ? 'reuse' : ''} ${props.randomize === false ? '' : 'randomize'} ${language} ${id}></micro-parsons>`
    parentElem.innerHTML = innerHTML;
    (parentElem.firstChild as MicroParsonsElement).parsonsExplanation = props.parsonsTooltips;
    (parentElem.firstChild as MicroParsonsElement).parsonsData = props.parsonsBlocks;
}

customElements.define('micro-parsons', MicroParsonsElement);
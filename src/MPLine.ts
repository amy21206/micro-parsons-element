import { ParsonsInput } from "./ParsonsInput";
import { MicroParsonsElement } from "./micro-parsons";

export class MPLine extends HTMLElement{

    // not sure if this should be public... trying to get it to work
    public hparsonsInput: ParsonsInput | null;
    private _inputDiv: HTMLDivElement;

    constructor(){
        super();
        this.hparsonsInput = null;
        this._inputDiv = document.createElement('div');
    }

    connectedCallback() {
        const reusable = this.getAttribute('reuse') ? true : false;
        const randomize = this.getAttribute('randomize') ? true : false;
        this.appendChild(this._inputDiv)
        this.hparsonsInput = new ParsonsInput(this._getParentMP(), reusable, randomize, this._inputDiv);
    }

    private _getParentMP() {
        return this.closest('micro-parsons') as MicroParsonsElement;
    }
}
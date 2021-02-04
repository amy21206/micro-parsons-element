import {ParsonsInput} from './ParsonsInput';

export class ParsonsElement extends HTMLElement {
    private textChild: HTMLSpanElement;
    private _parsonsData: Array<string>;
    private parsonsInput: ParsonsInput;

    constructor() {
        super();

        this.textChild = document.createElement('span');
        this.appendChild(this.textChild);
        this.textChild.innerText = 'text not set';

        this._parsonsData = new Array<string>();

        this.parsonsInput = new ParsonsInput();
        this.appendChild(this.parsonsInput.el);
    }

    set parsonsData(data: Array<string>) {
        this._parsonsData = data;
        this.textChild.innerText = this._parsonsData.toString();
    }

    get parsonsData(): Array<string> {
        return this._parsonsData;
    }
}

customElements.define('parsons-element', ParsonsElement);
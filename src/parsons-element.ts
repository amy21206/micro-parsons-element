export class ParsonsElement extends HTMLElement {
    private textChild: HTMLSpanElement;
    private _parsonsData: Array<string>;

    constructor() {
        super();

        this.textChild = document.createElement('span');
        this.appendChild(this.textChild);
        this.textChild.innerText = 'text not set';

        this._parsonsData = new Array<string>();
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
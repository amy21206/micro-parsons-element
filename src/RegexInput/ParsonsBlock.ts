export class ParsonsBlock {
    public el: HTMLDivElement;
    private _parsonsText: string;
    public isSource: boolean;
    private _dragStart: boolean;

    constructor() {
        this.el = document.createElement('div');
        // TODO: (refactor) use a css file
        this.el.style.backgroundColor = 'white';
        this.el.style.marginBottom = '1px';
        this.el.style.marginTop = '1px';
        this.el.style.marginRight = '1px';
        this.el.style.padding = '0 3px 0 3px';
        this.el.style.width = 'fit-content';
        this.el.style.display = 'inline-block';
        this.el.style.fontFamily = 'monospace';
        this.el.style.fontSize = 'large';

        // this.el.draggable = true;
        // this.el.ondragstart = this.onDragStart;

        this._parsonsText = 'block';
        this.isSource = true;

        this._dragStart = false;
    }

    set parsonsText(text: string) {
        this._parsonsText = text;
        this.el.innerText = this._parsonsText;
    }

    get parsonsText(): string{
        return this._parsonsText;
    }

    private onDragStart = (event: DragEvent): void => {
        this.el.style.backgroundColor = 'yellow';
        event.dataTransfer?.setData('text/plain', this.parsonsText);
    }

}
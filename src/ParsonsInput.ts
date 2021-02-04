import Sortable from 'sortablejs';
import { ParsonsElement } from './parsons-element';

export class ParsonsInput implements IParsonsInput {
    // The input element
    public el: HTMLDivElement;
    private _dropArea: HTMLDivElement;
    private _dragArea: HTMLDivElement;
    private _dropSortable: Sortable;
    private _dragSortable: Sortable;
    constructor() {
        this.el = document.createElement('div');
        this.el.id = 'parsons-input'

        this._dropArea = document.createElement('div');
        this.el.appendChild(this._dropArea);
        this._dropArea.style.height = '20px';
        this._dropArea.style.backgroundColor = '#bcebd7';

        this._dragArea = document.createElement('div');
        this.el.appendChild(this._dragArea);
        this._dragArea.style.height = '20px';
        this._dragArea.style.backgroundColor = '#fffcc4';

        this._dragSortable = new Sortable(this._dragArea, {
            group: {
                name: 'shared',
                pull: 'clone',
                put: false
            },
            sort: false,
            direction: 'horizontal',
            animation: 150
        });

        this._dropSortable = new Sortable(this._dropArea, {
            group: 'shared',
            direction: 'horizontal',
            animation: 150
        });

        const sheet = document.createElement('style');
        sheet.innerHTML += '.parsons-block {display: inline-block; font-family: monospace; font-size: large; background-color: white; padding: 0 3px 0 3px;}\n';
        // sheet.innerHTML += '.parsons-block:hover, .parsons-block:focus { border:solid ;}\n';
        document.body.appendChild(sheet);
    }

    public getText = (): string => {
        let ret = '';
        if (this._dropArea.hasChildNodes()) {
            let el = this._dropArea.firstChild as HTMLDivElement;
            ret += el.innerText;
            while (el.nextSibling) {
                el = el.nextSibling as HTMLDivElement;
                ret += el.innerText;
            }
            return ret;
        } else {
            return ret;
        }
    }

    public setSourceBlocks = (data: Array<string>): void => {
        // reset
        this._dragSortable.destroy();
        this._dropSortable.destroy();

        this._dragArea.innerHTML = '';
        this._dropArea.innerHTML = '';

        for (let i = 0; i < data.length; ++i) {
            const newBlock = document.createElement('div');
            this._dragArea.appendChild(newBlock);
            newBlock.innerText = data[i];
            newBlock.style.display = 'inline-block';
            newBlock.classList.add('parsons-block');
        }

        this._dragSortable = new Sortable(this._dragArea, {
            group: {
                name: 'shared',
                pull: 'clone',
                put: false
            },
            sort: false,
            direction: 'horizontal',
            animation: 150
        });

        this._dropSortable = new Sortable(this._dropArea, {
            group: 'shared',
            direction: 'horizontal',
            animation: 150
        });
    }
}
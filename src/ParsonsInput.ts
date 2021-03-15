import Sortable, { MoveEvent } from 'sortablejs';
import { RegexEvent } from './LoggingEvents';

declare class RegexElement{
    logEvent(event: any): void;
}

export class ParsonsInput implements IRegexInput {
    // The input element
    public el: HTMLDivElement;
    private _dropArea: HTMLDivElement;
    private _dragArea: HTMLDivElement;
    private _dropSortable: Sortable;
    private _dragSortable: Sortable;
    public parentElement: RegexElement | null;
    constructor() {
        this.el = document.createElement('div');
        this.el.id = 'parsons-input'

        this.el.append('Drag or click to select from the symbols below to form your regex')

        this._dragArea = document.createElement('div');
        this.el.appendChild(this._dragArea);
        this._dragArea.classList.add('drag-area');
        this._dragArea.style.height = '20px';
        this._dragArea.style.backgroundColor = '#fffcc4';

        this.el.append('Regex:')

        this._dropArea = document.createElement('div');
        this.el.appendChild(this._dropArea);
        this._dropArea.classList.add('drop-area');
        this._dropArea.style.height = '20px';
        // this._dropArea.style.backgroundColor = '#bcebd7';

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
        this._initSortable();

        this.parentElement = null;
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

    public setSourceBlocks = (data: Array<string>, tooltips:Array<string>|null): void => {
        // reset
        // this._dragSortable.destroy();
        // this._dropSortable.destroy();

        this._dragArea.innerHTML = '';
        this._dropArea.innerHTML = '';

        for (let i = 0; i < data.length; ++i) {
            const newBlock = document.createElement('div');
            this._dragArea.appendChild(newBlock);
            newBlock.innerText = data[i];
            newBlock.style.display = 'inline-block';
            newBlock.classList.add('parsons-block');
            if (tooltips) {
                const tooltip = document.createElement('span');
                newBlock.appendChild(tooltip);
                tooltip.innerText = tooltips[i];
                tooltip.classList.add('tooltip');
            }
        }

        this._initSortable();
    }
    
    private _initSortable = (): void => {
        this._dragSortable.destroy();
        this._dropSortable.destroy();

        this._dragSortable = new Sortable(this._dragArea, {
            group: {
                name: 'shared',
                pull: 'clone',
                put: false
            },
            sort: false,
            direction: 'horizontal',
            animation: 150,
            draggable: '.parsons-block',
        });

        this._dropSortable = new Sortable(this._dropArea, {
            group: 'shared',
            direction: 'horizontal',
            animation: 150,
            draggable: '.parsons-block',
            onAdd: () => {
                this.el.dispatchEvent(new Event('regexChanged'));
            },
            onStart: () => {
                console.log('onstart');
            },
            onEnd: (event: any) => {
                // TODO: (bug) This is a workaround that only works in the demo.
                // compare clientY with the position of item.
                if (event.originalEvent.clientY > 250) {
                    const item = event.item as HTMLElement;
                    if (item.parentNode) {
                        item.parentNode.removeChild(item);
                    }
                }
                this.el.dispatchEvent(new Event('regexChanged'));
                // const parsonsEvent: RegexEvent.ParsonsInputEvent = {
                //     eventType: 'parsons',
                //     action: RegexEvent.ParsonsInputAction.MOVE,
                //     position: [1, 2],
                //     answer: ['abcde']
                // };
                // if (this.parentElement) {
                //     this.parentElement.logEvent(parsonsEvent);
                // }
            },
        });
    }

    public updateTestStatus = (result: string): void => {
        if (this._dropArea.classList.contains(result)) {
            return;
        }
        if (this._dropArea.classList.contains('Pass')) {
            this._dropArea.classList.remove('Pass');
        }
        else if (this._dropArea.classList.contains('Fail')) {
            this._dropArea.classList.remove('Fail');
        }
        else if (this._dropArea.classList.contains('Error')) {
            this._dropArea.classList.remove('Error');
        }
        this._dropArea.classList.add(result);
    }
}
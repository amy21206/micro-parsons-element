import Sortable, { MoveEvent } from 'sortablejs';
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
        this._initSortable();

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
            // dragoverBubble: true,
            // onStart(event: Sortable.SortableEvent) {
            //     console.log('drop');
            //     console.log(event);
            // },
            // onMove(event: MoveEvent, originalEvent: Event): boolean|void|1|-1 {
            //     console.log('droponmove');
            //     console.log(event);
            //     return true;
            // },
            // onChoose(event: Sortable.SortableEvent) {
            //     console.log('onchoose');
            //     console.log(event);
            // },
            // onUnchoose(event: Sortable.SortableEvent) {
            //     console.log('onunchoose');
            //     console.log(event);
            // },
            // onStart(event: Sortable.SortableEvent) {
            //     console.log('drag');
            //     console.log(event);
            // },
            onEnd: (event: any) => {
                // TODO: (bug) This is a workaround that only works in the demo.
                // compare clientY with the position of item.
                if (event.originalEvent.clientY > 60) {
                    const item = event.item as HTMLElement;
                    if (item.parentNode) {
                        item.parentNode.removeChild(item);
                    }
                }
            },
            // onAdd(event: Sortable.SortableEvent) {
            //     console.log('onadd');
            //     console.log(event);
            // },
            // onUpdate(event: Sortable.SortableEvent) {
            //     console.log('onupdate');
            //     console.log(event);
            // },
            // onRemove(event: Sortable.SortableEvent) {
            //     console.log('onremove');
            //     console.log(event);
            // },
            // onMove(event: MoveEvent, originalEvent: Event): boolean|void|1|-1 {
            //     console.log('onmove');
            //     console.log(event);
            //     console.log(originalEvent);
            //     return true;
            // },
        });
    }

    private _onDropDraggingEnd = (event: Sortable.SortableEvent): void => {
        console.log('onEnd');
        console.log(event);
    }

    // private _onDropDraggingEnd = (event: Sortable.SortableEvent): void => {
    //     console.log('onEnd');
    //     console.log(event);
    // }
}
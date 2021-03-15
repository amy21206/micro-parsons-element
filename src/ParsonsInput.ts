import Sortable, { MoveEvent } from 'sortablejs';
import { RegexEvent } from './LoggingEvents';

declare class RegexElement{
    logEvent(event: any): void;
    public temporaryInputEvent: any;
}

export class ParsonsInput implements IRegexInput {
    // The input element
    public el: HTMLDivElement;
    private _dropArea: HTMLDivElement;
    private _dragArea: HTMLDivElement;
    private _dropSortable: Sortable;
    private _dragSortable: Sortable;
    public parentElement: RegexElement | null;
    private _prevPosition: number;
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
        this._prevPosition = -1;

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
                newBlock.onmouseover = () => {
                    if ((newBlock.parentNode as HTMLDivElement).classList.contains('drag-area')) {
                        const parsonsTooltipEvent: RegexEvent.ParsonsTooltipEvent = {
                            'event-type': 'parsons-tooltip',
                            block: data[i],
                            tooltip: tooltips[i]
                        }
                        this.parentElement?.logEvent(parsonsTooltipEvent);
                    }
                }
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
            onAdd: (event) => {
                // getting the position 
                if (this.parentElement) {
                    this.parentElement.temporaryInputEvent = {
                        'event-type': 'parsons',
                        action: RegexEvent.ParsonsInputAction.ADD,
                        position: [-1, this._getBlockPosition(event.item)],
                        answer: this._getTextArray()
                    };
                }
                this.el.dispatchEvent(new Event('regexChanged'));
            },
            onStart: (event) => {
                this._prevPosition = this._getBlockPosition(event.item);
            },
            onEnd: (event) => {
                // TODO: (bug) This is a workaround that only works in the demo.
                // compare clientY with the position of item.
                let endposition = 0;
                let action = RegexEvent.ParsonsInputAction.MOVE;
                if ((event as any).originalEvent.clientY > 250) {
                    const item = event.item as HTMLElement;
                    if (item.parentNode) {
                        item.parentNode.removeChild(item);
                    }
                    endposition = -1;
                    action = RegexEvent.ParsonsInputAction.REMOVE;
                } else {
                    endposition = this._getBlockPosition(event.item);
                }
                if (this.parentElement) {
                    this.parentElement.temporaryInputEvent = {
                        'event-type': 'parsons',
                        action: action,
                        position: [this._prevPosition, endposition],
                        answer: this._getTextArray()
                    };
                }
                this.el.dispatchEvent(new Event('regexChanged'));
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

    private _getBlockPosition = (block: HTMLElement): number => {
        let position = 0;
        const parent = block.parentNode;
        if (parent) {
            for (position = 0; position < parent.childNodes.length; ++position) {
                if(parent.childNodes[position] === block) {
                    break;
                }
            }
        }
        return position;
    }

    private _getTextArray = (): Array<string> => {
        let answer: Array<string> = [];
        if (this._dropArea.hasChildNodes()) {
            let el = this._dropArea.firstChild as HTMLDivElement;
            answer.push(el.innerText);
            while (el.nextSibling) {
                el = el.nextSibling as HTMLDivElement;
                answer.push(el.innerText);
            }
        }
        return answer;
    }
}
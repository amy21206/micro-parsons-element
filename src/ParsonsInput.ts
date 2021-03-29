import Sortable, { MoveEvent } from 'sortablejs';
import { RegexEvent } from './LoggingEvents';

declare class RegexElement {
    logEvent(event: any): void;
    public temporaryInputEvent: any;
}

export class ParsonsInput implements IRegexInput {
    // The input element
    public el: HTMLDivElement;
    // TODO(refactor): make expandable blocks more easy to use
    public expandableBlocks: Array<string>;
    public expandableBlockTooltips: Array<string> | null;
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

        this.expandableBlocks = [];
        this.expandableBlockTooltips = null;

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

    public setSourceBlocks = (data: Array<string>, tooltips: Array<string> | null): void => {
        // reset
        // this._dragSortable.destroy();
        // this._dropSortable.destroy();

        // clearing previous settings 
        this._dragArea.innerHTML = '';
        this._dropArea.innerHTML = '';

        // adding expandable blocks
        for (let i = 0; i < this.expandableBlocks.length; ++i) {
            const newBlock = document.createElement('div');
            this._dragArea.appendChild(newBlock);
            newBlock.innerText = this.expandableBlocks[i];
            newBlock.style.display = 'inline-block';
            newBlock.classList.add('parsons-block');
            newBlock.classList.add('expandable-block');
            if (this.expandableBlockTooltips) {
                const tooltip = document.createElement('span');
                newBlock.appendChild(tooltip);
                tooltip.innerText = this.expandableBlockTooltips[i];
                tooltip.classList.add('tooltip');
                newBlock.onmouseover = () => {
                    if ((newBlock.parentNode as HTMLDivElement).classList.contains('drag-area')) {
                        const parsonsTooltipEvent: RegexEvent.ParsonsTooltipEvent = {
                            'event-type': 'parsons-tooltip',
                            block: this.expandableBlocks[i],
                            tooltip: tooltip.innerText,
                            start: true
                        }
                        this.parentElement?.logEvent(parsonsTooltipEvent);
                    }
                }
                newBlock.onmouseout = () => {
                    if ((newBlock.parentNode as HTMLDivElement).classList.contains('drag-area')) {
                        const parsonsTooltipEvent: RegexEvent.ParsonsTooltipEvent = {
                            'event-type': 'parsons-tooltip',
                            block: this.expandableBlocks[i],
                            tooltip: tooltip.innerText,
                            start: false
                        }
                        this.parentElement?.logEvent(parsonsTooltipEvent);
                    }
                }
            }
            newBlock.onclick = () => {
                console.log('expandable block onclick');
                if ((newBlock.parentNode as HTMLDivElement).classList.contains('drag-area')) {
                    const text = this.expandableBlocks[i];
                    let firstBlock = null;
                    for (let i = 0; i < text.length; ++i) {
                        const newBlock = document.createElement('div');
                        this._dropArea.appendChild(newBlock);
                        newBlock.innerText = text.charAt(i);
                        newBlock.style.display = 'inline-block';
                        newBlock.classList.add('parsons-block');
                        (newBlock as HTMLDivElement).onclick = () => {
                            console.log('expandable new block onclick')
                            newBlock.parentNode?.removeChild(newBlock);
                            this.el.dispatchEvent(new Event('regexChanged'));
                            // urgent todo: add event here
                        }
                        if (firstBlock == null) {
                            firstBlock = newBlock;
                        }
                    }
                    if (this.parentElement && firstBlock) {
                        this.parentElement.temporaryInputEvent = {
                            'event-type': 'parsons',
                            action: RegexEvent.ParsonsInputAction.ADD,
                            position: [-1, this._getBlockPosition(firstBlock as HTMLElement)],
                            answer: this._getTextArray(),
                            'is-expandable': true,
                            'add-by-click': true
                        };
                    }
                    this.el.dispatchEvent(new Event('regexChanged'));
                }
            }
        }

        // adding normal blocks
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
                            tooltip: tooltips[i],
                            start: true
                        }
                        this.parentElement?.logEvent(parsonsTooltipEvent)
                    }
                }
                newBlock.onmouseout = () => {
                    if ((newBlock.parentNode as HTMLDivElement).classList.contains('drag-area')) {
                        const parsonsTooltipEvent: RegexEvent.ParsonsTooltipEvent = {
                            'event-type': 'parsons-tooltip',
                            block: data[i],
                            tooltip: tooltips[i],
                            start: false
                        }
                        this.parentElement?.logEvent(parsonsTooltipEvent);
                    }
                }
            }
            newBlock.onclick = () => {
                console.log('normal block onclick');
                if ((newBlock.parentNode as HTMLDivElement).classList.contains('drag-area')) {
                    let newBlockCopy = newBlock.cloneNode(true);
                    this._dropArea.appendChild(newBlockCopy);
                    (newBlockCopy as HTMLDivElement).onclick = () => {
                        console.log('normal new block onclick')
                        newBlockCopy.parentNode?.removeChild(newBlockCopy);
                        this.el.dispatchEvent(new Event('regexChanged'));
                        // urgent todo: add event here
                    }
                    if (this.parentElement) {
                        this.parentElement.temporaryInputEvent = {
                            'event-type': 'parsons',
                            action: RegexEvent.ParsonsInputAction.ADD,
                            position: [-1, this._getBlockPosition(newBlockCopy as HTMLElement)],
                            answer: this._getTextArray(),
                            'is-expandable': false,
                            'add-by-click': true
                        };
                    }
                    this.el.dispatchEvent(new Event('regexChanged'));
                }
                if ((newBlock.parentNode as HTMLDivElement).classList.contains('drop-area')) {
                    newBlock.parentNode?.removeChild(newBlock);
                    this.el.dispatchEvent(new Event('regexChanged'));
                    // urgent todo: add event here
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
            onStart: (event) => {
                console.log('drag on start');
            },
            onEnd: (event) => {
                console.log('drag on end');
            },
            onRemove: (event) => {
                console.log('drag on remove');
            },
            onClone: (event) => {
                console.log('drag on clone');
                console.log(event.item.onclick);
                console.log(event.clone.onclick);
                const newBlock = event.clone;
                if (event.item.classList.contains('expandable-block')) {
                    newBlock.onclick = () => {
                        console.log('expandable block onclick');
                        if ((newBlock.parentNode as HTMLDivElement).classList.contains('drag-area')) {
                            const text = (newBlock.firstChild?.textContent) || '';
                            let firstBlock = null;
                            for (let i = 0; i < text.length; ++i) {
                                const newBlock = document.createElement('div');
                                this._dropArea.appendChild(newBlock);
                                newBlock.innerText = text.charAt(i);
                                newBlock.style.display = 'inline-block';
                                newBlock.classList.add('parsons-block');
                                (newBlock as HTMLDivElement).onclick = () => {
                                    console.log('expandable new block onclick')
                                    newBlock.parentNode?.removeChild(newBlock);
                                    this.el.dispatchEvent(new Event('regexChanged'));
                                    // urgent todo: add event here
                                }
                                if (firstBlock == null) {
                                    firstBlock = newBlock;
                                }
                            }
                            if (this.parentElement && firstBlock) {
                                this.parentElement.temporaryInputEvent = {
                                    'event-type': 'parsons',
                                    action: RegexEvent.ParsonsInputAction.ADD,
                                    position: [-1, this._getBlockPosition(firstBlock as HTMLElement)],
                                    answer: this._getTextArray(),
                                    'is-expandable': true,
                                    'add-by-click': true
                                };
                            }
                            this.el.dispatchEvent(new Event('regexChanged'));
                        }
                    }
                } else {
                    newBlock.onclick = () => {
                        console.log('normal block onclick');
                        if ((newBlock.parentNode as HTMLDivElement).classList.contains('drag-area')) {
                            let newBlockCopy = newBlock.cloneNode(true);
                            this._dropArea.appendChild(newBlockCopy);
                            (newBlockCopy as HTMLDivElement).onclick = () => {
                                console.log('normal new block onclick')
                                newBlockCopy.parentNode?.removeChild(newBlockCopy);
                                this.el.dispatchEvent(new Event('regexChanged'));
                                // urgent todo: add event here
                            }
                            if (this.parentElement) {
                                this.parentElement.temporaryInputEvent = {
                                    'event-type': 'parsons',
                                    action: RegexEvent.ParsonsInputAction.ADD,
                                    position: [-1, this._getBlockPosition(newBlockCopy as HTMLElement)],
                                    answer: this._getTextArray(),
                                    'is-expandable': false,
                                    'add-by-click': true
                                };
                            }
                            this.el.dispatchEvent(new Event('regexChanged'));
                        }
                        if ((newBlock.parentNode as HTMLDivElement).classList.contains('drop-area')) {
                            newBlock.parentNode?.removeChild(newBlock);
                            this.el.dispatchEvent(new Event('regexChanged'));
                            // urgent todo: add event here
                        }
                    }
                }
            }
        });

        this._dropSortable = new Sortable(this._dropArea, {
            group: 'shared',
            direction: 'horizontal',
            animation: 150,
            draggable: '.parsons-block',
            onAdd: (event) => {
                // getting the position 
                const isExpandable = event.item.classList.contains('expandable-block');
                console.log(isExpandable);
                if (this.parentElement) {
                    this.parentElement.temporaryInputEvent = {
                        'event-type': 'parsons',
                        action: RegexEvent.ParsonsInputAction.ADD,
                        position: [-1, this._getBlockPosition(event.item)],
                        answer: this._getTextArray(),
                        'is-expandable': isExpandable,
                        'add-by-click': false
                    };
                }
                if (isExpandable) {
                    const parentNode = event.item.parentNode;
                    const text = event.item.innerText;
                    const insertPosition = this._getBlockPosition(event.item);
                    const nextSibling = event.item.nextSibling;
                    parentNode?.removeChild(event.item);
                    for (let i = 0; i < text.length; ++i) {
                        const newBlock = document.createElement('div');
                        if (insertPosition == 0) {
                            this._dropArea.appendChild(newBlock);
                        } else {
                            parentNode?.insertBefore(newBlock, nextSibling);
                        }
                        newBlock.innerText = text.charAt(i);
                        newBlock.style.display = 'inline-block';
                        newBlock.classList.add('parsons-block');
                        (newBlock as HTMLDivElement).onclick = () => {
                            console.log('expandable new block onclick')
                            newBlock.parentNode?.removeChild(newBlock);
                            this.el.dispatchEvent(new Event('regexChanged'));
                            // urgent todo: add event here
                        }
                    }
                }
                this.el.dispatchEvent(new Event('regexChanged'));
            },
            onStart: (event) => {
                this._prevPosition = this._getBlockPosition(event.item);
            },
            onEnd: (event) => {
                // TODO: (bug) This is a workaround that only works in the demo.
                // compare clientY with the position of item.
                console.log(event.item.onclick);
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
                        answer: this._getTextArray(),
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

    public setExpandableBlocks = (expandableBlocks: Array<string>): void => {
        this.expandableBlocks = expandableBlocks;
    }

    private _getBlockPosition = (block: HTMLElement): number => {
        let position = 0;
        const parent = block.parentNode;
        if (parent) {
            for (position = 0; position < parent.childNodes.length; ++position) {
                if (parent.childNodes[position] === block) {
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
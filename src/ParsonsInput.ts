import Sortable, { MoveEvent } from 'sortablejs';
import { RegexEvent } from './LoggingEvents';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import sql from 'highlight.js/lib/languages/sql';
import xml from 'highlight.js/lib/languages/xml';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('java', java);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('python', python);

declare class HorizontalParsons {
    logEvent(event: any): void;
    public temporaryInputEvent: any;
    public toolNumber: number;
    public language: string | undefined;
}

export class ParsonsInput implements IHParsonsInput {
    // The input element
    public el: HTMLDivElement;
    private _dropArea: HTMLDivElement;
    private _dragArea: HTMLDivElement;
    private _dropSortable: Sortable | null;
    private _dragSortable: Sortable | null;
    public parentElement: HorizontalParsons;
    private _prevPosition: number;
    public reusable: boolean;
    private randomize: boolean;
    private storedSourceBlocks: Array<string>;
    private storedSourceBlockExplanations: Array<string> | null;
    private hljsLanguage: string | undefined;

    private contextBefore: HTMLDivElement;
    private contextAfter: HTMLDivElement;

    // if the input has been initialized once
    private initialized: boolean;
    constructor(parentElement: HorizontalParsons, reusable: boolean, randomize: boolean) {
        this.el = document.createElement('div');

        this.parentElement = parentElement;

        this.el.id = 'regextool-' + this.parentElement.toolNumber + '-parsons-input'

        const dragTip = document.createElement('div');
        dragTip.innerText = 'Drag or click the blocks below to form your code:';
        dragTip.classList.add('hparsons-tip');
        this.el.append(dragTip);

        this._dragArea = document.createElement('div');
        this.el.appendChild(this._dragArea);
        this._dragArea.classList.add('drag-area');

        const dropTip = document.createElement('div');
        dropTip.innerText = 'Your code (click on a block to remove it):';
        dropTip.classList.add('hparsons-tip');
        this.el.append(dropTip);

        const contextBefore = document.createElement('div');
        contextBefore.id = 'hparsons-' + this.parentElement.toolNumber + '-context-before';
        contextBefore.classList.add('context');
        contextBefore.classList.add('hide');
        this.el.appendChild(contextBefore);
        this.contextBefore = contextBefore;

        this._dropArea = document.createElement('div');
        this.el.appendChild(this._dropArea);
        this._dropArea.classList.add('drop-area');
        this._prevPosition = -1;

        const contextAfter = document.createElement('div');
        contextAfter.id = 'hparsons-' + this.parentElement.toolNumber + '-context-after';
        contextAfter.classList.add('context');
        contextAfter.classList.add('hide');
        this.el.appendChild(contextAfter);
        this.contextAfter = contextAfter;

        this.storedSourceBlocks = [];
        this.storedSourceBlockExplanations = null;

        this.reusable = reusable;
        this.randomize = randomize;

        this._dragSortable = null;
        this._dropSortable = null;
        this._initSortable();

        this.initialized = false;

        this.hljsLanguage = this.parentElement.language;
    }

    public getText = (): string => {
        let ret = '';
        if (this._dropArea.hasChildNodes()) {
            let el = this._dropArea.firstChild as HTMLDivElement;
            ret += el.innerText.replace(/\xA0/g, ' ');
            while (el.nextSibling) {
                el = el.nextSibling as HTMLDivElement;
                ret += el.innerText.replace(/\xA0/g, ' ');
            }
            return ret;
        } else {
            return ret;
        }
    }

    // Durstenfeld shuffle
    private shuffleArray(array: Array<any>) {
        for (let i = array.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            let temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    }

    public setSourceBlocks = (data: Array<string>, tooltips: Array<string> | null): void => {
        // shuffle source blocks if randomize
        if (this.randomize) {
            let originalData = JSON.stringify(data);
            this.shuffleArray(data);
            while (JSON.stringify(data) == originalData) {
                this.shuffleArray(data);
            }
        }

        this.storedSourceBlocks = data;
        this.storedSourceBlockExplanations = tooltips;
        this._resetInput();
    }

    // TODO: not efficient enough. should not need to create new elements; simply sorting them should be good.
    private _resetInput = (): void => {
        // clearing previous blocks
        while (this._dragArea.firstChild) {
            this._dragArea.removeChild(this._dragArea.firstChild);
        }
        while (this._dropArea.firstChild) {
            this._dropArea.removeChild(this._dropArea.firstChild);
        }

        // add new blocks
        for (let i = 0; i < this.storedSourceBlocks.length; ++i) {
            const newBlock = document.createElement('div');
            this._dragArea.appendChild(newBlock);
            if (this.storedSourceBlocks[i] === ' ') {
                // console.log('here');
                newBlock.innerHTML = '&nbsp;';
            } else {
                // console.log(data[i]);
                if (this.hljsLanguage) {
                    newBlock.innerHTML = hljs.highlight(this.storedSourceBlocks[i], {language: this.hljsLanguage, ignoreIllegals: true}).value
                } else {
                    newBlock.innerText = this.storedSourceBlocks[i];
                }
            }
            newBlock.style.display = 'inline-block';
            newBlock.classList.add('parsons-block');
            newBlock.onclick = () => {
                this._onBlockClicked(newBlock);
            }
        }

    }

    private _onBlockClicked = (block: Node): void => {
        if (block.parentElement == this._dragArea) {
            let endPosition;
            if (this.reusable) {
                const blockCopy = block.cloneNode(true) as HTMLDivElement;
                blockCopy.onclick = () => this._onBlockClicked(blockCopy);
                this._dropArea.appendChild(blockCopy);
                endPosition = this._getBlockPosition(blockCopy);
            } else {
                this._dropArea.appendChild(block);
                endPosition = this._getBlockPosition(block);
            }
            const inputEvent = {
                'event-type': 'parsons-input',
                action: 'add',
                position: [-1, endPosition],
                answer: this._getTextArray(),
            };
            this.parentElement.logEvent(inputEvent);
        } else {
            const startPosition = this._getBlockPosition(block);
            if (this.reusable) {
                this._dropArea.removeChild(block);
            } else {
                this._dragArea.appendChild(block);
            }
            const inputEvent = {
                'event-type': 'parsons-input',
                action: 'remove',
                position: [startPosition, -1],
                answer: this._getTextArray(),
            };
            this.parentElement.logEvent(inputEvent);
        }
    }

    private _initSortable = (): void => {

        if (this.reusable) {
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
                onClone: (event) => {
                    const newBlock = event.clone;
                    newBlock.onclick = () => this._onBlockClicked(newBlock);
                }
            });

            this._dropSortable = new Sortable(this._dropArea, {
                group: 'shared',
                direction: 'horizontal',
                animation: 150,
                draggable: '.parsons-block',
                onAdd: (event) => {
                    const inputEvent = {
                        'event-type': 'parsons-input',
                        action: 'add',
                        position: [-1, this._getBlockPosition(event.item)],
                        answer: this._getTextArray(),
                    };
                    this.parentElement.logEvent(inputEvent);
                },
                onStart: (event) => {
                    this._prevPosition = this._getBlockPosition(event.item);
                },
                onEnd: (event) => {
                    let endposition;
                    let action = 'move';
                    const upperbound = this._dropArea.getBoundingClientRect().top;
                    const lowerbound = this._dropArea.getBoundingClientRect().bottom;
                    if ((event as any).originalEvent.clientY > lowerbound || (event as any).originalEvent.clientY < upperbound ) {
                        const item = event.item as HTMLElement;
                        if (item.parentNode) {
                            item.parentNode.removeChild(item);
                        }
                        endposition = -1;
                        action = 'remove';
                    } else {
                        endposition = this._getBlockPosition(event.item);
                    }
                    const inputEvent = {
                        'event-type': 'parsons-input',
                        action: action,
                        position: [this._prevPosition, endposition],
                        answer: this._getTextArray(),
                    };
                    this.parentElement.logEvent(inputEvent);
                },
            });

        } else {
            this._dragSortable = new Sortable(this._dragArea, {
                group: {
                    name: 'shared',
                    // pull: 'clone',
                    // put: false
                },
                // sort: false,
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
                    const inputEvent = {
                        'event-type': 'parsons-input',
                        action: 'add',
                        position: [-1, this._getBlockPosition(event.item)],
                        answer: this._getTextArray(),
                    };
                    this.parentElement.logEvent(inputEvent);
                },
                onStart: (event) => {
                    this._prevPosition = this._getBlockPosition(event.item);
                },
                onEnd: (event) => {
                    let endposition = this._getBlockPosition(event.item);
                    const action = endposition == -1 ? 'remove' : 'move';
                    const inputEvent = {
                        'event-type': 'parsons-input',
                        action: action,
                        position: [this._prevPosition, endposition],
                        answer: this._getTextArray(),
                    };
                    this.parentElement.logEvent(inputEvent);
                },
            });
        }
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

    private _getBlockPosition = (block: Node): number => {
        let position = -1;
        const parent = this._dropArea;
        if (parent) {
            for (position = 0; position < parent.childNodes.length; ++position) {
                if (parent.childNodes[position] === block) {
                    break;
                }
            }
        }
        return position;
    }

    public _getTextArray = (): Array<string> => {
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

    public highlightError = (position: number): void => {
        // console.log(position);
        let count = 0;
        if (this._dropArea.hasChildNodes()) {
            let el = this._dropArea.firstChild as HTMLDivElement;
            count += el.innerText.length;
            if (count >= position) {
                // the current block contains the symbol with error
                el.style.backgroundColor = '#ff99b3';
            } else {
                while (el.nextSibling) {
                    el = el.nextSibling as HTMLDivElement;
                    count += el.innerText.length;
                    if (count >= position) {
                        // the current block contains the symbol with error
                        el.style.backgroundColor = '#ff99b3';
                        break;
                    }
                }
            }
        }
    }

    public removeFormat = (): void => {
        if (this._dropArea.hasChildNodes()) {
            let el = this._dropArea.firstChild as HTMLDivElement;
            el.style.removeProperty('background-color');
            while (el.nextSibling) {
                el = el.nextSibling as HTMLDivElement;
                el.style.removeProperty('background-color');
            }
        }
    }
    
    public resetInput = (): void => {
        if (this.reusable) {
            while (this._dropArea.firstChild) {
                this._dropArea.removeChild(this._dropArea.firstChild);
            }
        } else {
            this._resetInput();
        }
    }

    // TODO: not used for now, not sure if is working correctly
    public restoreAnswer(type: string, answer: any): void {
        if (type != 'parsons' || !Array.isArray(answer)) {
            return;
        }
        this._dropArea.innerHTML = '';
        for (let i = 0; i < answer.length; ++i) {
            if (typeof answer[i] === 'string') {
                const newBlock = document.createElement('div');
                this._dropArea.appendChild(newBlock);
                newBlock.innerText = answer[i];
                newBlock.style.display = 'inline-block';
                newBlock.classList.add('parsons-block');
                (newBlock as HTMLDivElement).onclick = () => {
                    // clicking the new block generated by clicking an extendable block to remove that block
                    // console.log('expandable new block onclick')
                    const endPosition = this._getBlockPosition(newBlock as HTMLElement);
                    newBlock.parentNode?.removeChild(newBlock);
                    if (this.parentElement) {
                        this.parentElement.temporaryInputEvent = {
                            'event-type': 'parsons-input',
                            action: RegexEvent.ParsonsInputAction.REMOVE,
                            position: [endPosition, -1],
                            answer: this._getTextArray()
                        };
                    }
                }
                this.el.dispatchEvent(new Event('codeChanged'));
            }
        }
    }
    
    public setIndent = (indent: number): void => {
        const fontSize = Number(window.getComputedStyle(this.contextBefore, null).getPropertyValue('font-size').slice(0, -2));
        console.log(window.getComputedStyle(this.contextBefore, null).getPropertyValue('font-size'))
        this._dropArea.style.paddingLeft = fontSize * indent + 'px';
    }
}
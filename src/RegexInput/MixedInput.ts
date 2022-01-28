import Quill from 'quill';
import Delta from 'quill-delta';
import Sortable, { MoveEvent } from 'sortablejs';
import { RegexEvent } from '../LoggingEvents';
// need to import this to make sure the not editable blocks work
// import {BlockBlot} from './BlockBlot';
let Embed = Quill.import('blots/embed');

export class ParsonsBlot extends Embed {
    static create(content: string){
        let node: HTMLElement = super.create(content);
        node.innerText = content;
        node.contentEditable = 'false';
        node.draggable = true;
        return node;
    }

    static value(node: HTMLElement) {
        return node.childNodes[0].textContent;
    }
}

ParsonsBlot.blotName = 'parsons';
ParsonsBlot.tagName = 'SPAN';
ParsonsBlot.className = 'parsons-blot';

Quill.register(ParsonsBlot);

declare class RegexElement {
    logEvent(event: any): void;
    public temporaryInputEvent: any;
    appendChild(childElement: HTMLElement): void;
}

export class MixedInput implements IRegexInput {
    // base node
    public el: HTMLDivElement;
    public parentElement: RegexElement;

    // Parsons Blocks
    private _dragArea: HTMLDivElement;
    // private _dragSortable: Sortable;

    // Input area: Quill needs to be in a slot because was using shadow root on the outside.
    // The input area is not a child of this.el, but is put under the parent node, outside the shadow root.
    private _inputArea: HTMLDivElement;
    private _quill: Quill | null;

    // private block: BlockBlot | null;

    constructor(parentElement: RegexElement, inputDiv: HTMLDivElement) {
        console.log('constructor')
        // *** set the parent element when constructing the input
        this.parentElement = parentElement;

        // initializing html elements (need to put here because TypeScript Requires it to be initiallized in the constructor)
        this.el = document.createElement('div');
        this.el.id = 'mixed-input';
        this._dragArea = document.createElement('div');
        // the input area is not assembled here; it needs to be added 
        this._inputArea = document.createElement('div');
        this._inputArea.id = 'mixed-input-area';
        this._inputArea.slot = 'mixed-input-slot';

        // assembling html elements
        this._constructBaseElement(inputDiv);

        // adding functionality for dragging area using sortable library
        // this._dragSortable = new Sortable(this._dragArea, {});

        // adding functionality for quill
        this._quill = null;
        this.initQuill();
        
        // this.block = null;
    }

    // Constructs the HTML of the base element
    private _constructBaseElement = (inputDiv: HTMLDivElement): void => {

        // adding under inputDiv in the DOM tree (inside shadowroot)
        inputDiv.append(this.el);

        this.el.append('These blocks could be used to form your regex. Drag or click to use them.')

        // adding drag area 
        this.el.appendChild(this._dragArea);
        this._dragArea.classList.add('drag-area');
        this._dragArea.style.height = '20px';
        this._dragArea.style.backgroundColor = '#fffcc4';

        this.el.append('Your regex:')

        // the slot for putting the div used for quill for the input
        const mixedInputSlot = document.createElement('slot');
        mixedInputSlot.name = 'mixed-input-slot';
        this.el.appendChild(mixedInputSlot);

        // adding under the parent element (outside shadow root)
        this.parentElement.appendChild(this._inputArea);
    }

    public initQuill = (): void => {
        this._quill = new Quill('#mixed-input-area', {
            modules: {
                toolbar: false
            },
        })
        this._quill.setText('');
        this._quill.updateContents(
            new Delta().insert({ parsons: 'ThisIsABlock'}).insert('Test')
        );
        this._inputArea.ondrop = (event) => {
            console.log('ondrop')
            console.log(event)
            event.preventDefault();
            console.log((event.target! as HTMLElement).innerText)
            this._quill!.updateContents(
                new Delta().insert({ parsons: (event.target! as HTMLElement).innerText})
            );
            console.log('inserted')
        }
        this._inputArea.ondragover = (event) => {
            console.log('ondragover')
            console.log(event)
            event.preventDefault();
        }
        this._inputArea.ondragend = (event) => {
            console.log('ondragend')
            console.log(event)
            event.preventDefault();
        }
    }

    public setSourceBlocks = (data: Array<string>, tooltips: Array<string> | null): void => {
        // cleaning up previous blocks
        this._dragArea.innerHTML = '';

        // adding normal blocks
        for (let i = 0; i < data.length; ++i) {
            const newBlock = document.createElement('div');
            this._dragArea.appendChild(newBlock);
            if (data[i] === ' ') {
                // console.log('here');
                newBlock.innerHTML = '&nbsp;';
            } else {
                // console.log(data[i]);
                newBlock.innerText = data[i];
            }
            newBlock.draggable = true;
            newBlock.ondragstart = (event) => {
                event.dataTransfer?.setData
            }
            newBlock.style.display = 'inline-block';
            newBlock.classList.add('parsons-block');
            if (tooltips && tooltips.length > i) {
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
            // newBlock.onclick = () => {
            //     // console.log('normal block onclick');
            //     if ((newBlock.parentNode as HTMLDivElement).classList.contains('drag-area')) {
            //         let newBlockCopy = newBlock.cloneNode(true);
            //         (newBlockCopy as HTMLDivElement).onclick = () => {
            //             // console.log('normal new block onclick')
            //             // clicking on the new block generated by a normal block to remove the new block
            //             const endPosition = this._getBlockPosition(newBlockCopy as HTMLElement);
            //             newBlockCopy.parentNode?.removeChild(newBlockCopy);
            //             if (this.parentElement) {
            //                 this.parentElement.temporaryInputEvent = {
            //                     'event-type': 'parsons',
            //                     action: RegexEvent.ParsonsInputAction.REMOVE,
            //                     position: [endPosition, -1],
            //                     answer: this._getTextArray()
            //                 };
            //             }
            //             this.el.dispatchEvent(new Event('regexChanged'));
            //         }
            //         if (this.parentElement) {
            //             this.parentElement.temporaryInputEvent = {
            //                 'event-type': 'parsons',
            //                 action: RegexEvent.ParsonsInputAction.ADD,
            //                 position: [-1, this._getBlockPosition(newBlockCopy as HTMLElement)],
            //                 answer: this._getTextArray(),
            //                 'add-block-cnt': 1,
            //                 'is-expandable': false,
            //                 'add-by-click': true
            //             };
            //         }
            //         this.el.dispatchEvent(new Event('regexChanged'));
            //     }
            //     if ((newBlock.parentNode as HTMLDivElement).classList.contains('drop-area')) {
            //         // clicking on the normal block dragged down to remove the normal block
            //         const endPosition = this._getBlockPosition(newBlock as HTMLElement);
            //         newBlock.parentNode?.removeChild(newBlock);
            //         if (this.parentElement) {
            //             this.parentElement.temporaryInputEvent = {
            //                 'event-type': 'parsons',
            //                 action: RegexEvent.ParsonsInputAction.REMOVE,
            //                 position: [endPosition, -1],
            //                 answer: this._getTextArray(),
            //             };
            //         }
            //         this.el.dispatchEvent(new Event('regexChanged'));
            //     }
            // }
        }

    }

    // Returns students' text input
    public getText = (): string => {
        return 'stub'
    }

    // Updates the RegexInputs' UI based on unit test results
    public updateTestStatus = (result: string): void => {

    };

    // Highlights the syntax error position in the regex input
    public highlightError = (position: number): void => {

    }

    // Removes the syntax error highlight in regex input
    public removeFormat = (): void => {

    }
}
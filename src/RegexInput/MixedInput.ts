import Quill from 'quill';
import Delta from 'quill-delta';
import Sortable, { MoveEvent } from 'sortablejs';
// need to import this to make sure the not editable blocks work
// import {BlockBlot} from './BlockBlot';
let Embed = Quill.import('blots/embed');

export class ParsonsBlot extends Embed {

    // public _value: string;

    // constructor() {
    //     super();
    //     this._value = 'test';
    // }

    static create(content: string){
        let node: HTMLElement = super.create(content);
        node.innerText = content;
        node.contentEditable = 'false';
        return node;
    }

    static value(node: HTMLElement) {
        return node.childNodes[0].textContent;
    }

    // public static formats() {
    //     return 'span';
    // }



    // public format(name: string, value: string) {
    //     if (name === 'link' && value) {
    //         this.domNode.setAttribute('href'), value;
    //     } else {
    //         super.format(name, value);
    //     }
    // }

    // public formats() {
    //     let formats = super.formats();
    //     formats['link'] = BlockBlot.formats(this.domNode);
    //     return formats;
    // }
}

ParsonsBlot.blotName = 'parsons';
ParsonsBlot.tagName = 'SPAN';
// ParsonsBlot.className = 'parsons-block';

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
    private _dragSortable: Sortable;

    // Input area: Quill needs to be in a slot because was using shadow root on the outside.
    // The input area is not a child of this.el, but is put under the parent node, outside the shadow root.
    public _inputArea: HTMLDivElement;
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
        console.log('here')
        this._quill = new Quill('#mixed-input-area', {
            modules: {
                toolbar: false
            },
        })
        this._quill.setText('');
        console.log('test');
        this._quill.updateContents(
            new Delta().insert({ parsons: 'ThisIsABlock'}).insert('Test')
        );
        console.log('test1');
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
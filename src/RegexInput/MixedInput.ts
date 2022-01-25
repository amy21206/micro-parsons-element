import Sortable, { MoveEvent } from 'sortablejs';
import { RegexEvent } from '../LoggingEvents';

declare class RegexElement {
    logEvent(event: any): void;
    public temporaryInputEvent: any;
}

export class MixedInput implements IRegexInput {
    // base node
    public el: HTMLDivElement;
    public parentElement: RegexElement | null;

    // Parsons Blocks
    private _dragArea: HTMLDivElement;
    private _dragSortable: Sortable;

    constructor() {
        // *** set the parent element when constructing the input
        this.parentElement = null;

        // initializing html elements
        this.el = document.createElement('div');
        this.el.id = 'mixed-input'
        this._dragArea = document.createElement('div');

        // assembling html elements
        this._constructBaseElement();

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
    }

    // Constructs the HTML of the base element
    private _constructBaseElement = (): void => {

        this.el.append('These blocks could be used to form your regex. Drag or click to use them.')
        this.el.appendChild(this._dragArea);
        this.el.append('Your regex:')

        // adding classes and styles to html elements
        this._dragArea.classList.add('drag-area');
        this._dragArea.style.height = '20px';
        this._dragArea.style.backgroundColor = '#fffcc4';
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
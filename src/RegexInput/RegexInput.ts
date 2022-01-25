import Quill from 'quill';
import {randomColor} from 'randomcolor';
import { RegexEvent } from '../LoggingEvents';

declare class RegexElement{
    logEvent(event: any): void;
}

export class RegexInput implements IRegexInput {
    // The input element
    public el: HTMLDivElement;
    public quill: Quill | null;
    private groups: Array<PatternGroup>;
    public parentElement: RegexElement | null;
    // Indicates if the added text is drag and dropped from somewhere else. For logging purpose.
    public droppedText: boolean;
    constructor() {
        this.el = document.createElement('div');
        this.el.id = 'regex-input'
        this.el.classList.add('regex-input');
        
        this.quill = null;
        
        this.groups = new Array<PatternGroup>();

        // this.el.classList.add('regex-textbox')
        // this.el.setAttribute("rows", "1");
        this.parentElement = null;
        this.droppedText = false;
    }
    
    public initQuill = (): void => {
        // initializing quill
        this.quill = new Quill('#regex-input', {
            modules: {
                toolbar: false
            },
        })
        this.quill.keyboard.addBinding({
                key:'C',
                shortKey: true,
            },
            (range, context) => {
                const freeKeyboardEvent: RegexEvent.FreeKeyboardEvent = {
                    'event-type': 'free-input-keyboard',
                    range: range,
                    keys: ['ctrl', 'c'] 
                }
                if (this.parentElement) {
                    this.parentElement.logEvent(freeKeyboardEvent);
                }
                return true;
            },
        );
        this.quill.keyboard.addBinding({
                key:'V',
                shortKey: true,
            },
            (range, context) => {
                const freeKeyboardEvent: RegexEvent.FreeKeyboardEvent = {
                    'event-type': 'free-input-keyboard',
                    range: range,
                    keys: ['ctrl', 'v'] 
                }
                if (this.parentElement) {
                    this.parentElement.logEvent(freeKeyboardEvent);
                }
                return true;
            },
        );
        this.el.ondrop = (event) => {
            this.droppedText = true;
        }
    }

    public getText = (): string => {
        if (this.quill != null) {
            return this.quill.getText(0, this.quill.getLength() - 1);
        } else {
            return '';
        }
    }

    public highlightGroup = (colors: Array<string>): void => {
        this.calculateGroup();
        console.log(this.groups);
        this.quill?.removeFormat(0, this.quill.getLength() - 1, 'silent');
        // generate new colors for group if current colors are not enough
        const groupCount = this.groups.length;
        if (colors.length < groupCount) {
            this.generateColor(colors, groupCount - colors.length);
        }
        // highlight the groups (not working)
        for (let i = 0; i < this.groups.length; ++i) {
            this.quill?.formatText(this.groups[i].start, this.groups[i].end - this.groups[i].start, {
                'background': colors[i]
            }, 'silent');
        }
    }
    
    private calculateGroup = (): void => {
        let stack = new Array<number>();
        this.groups = new Array<PatternGroup>();
        const pattern = this.getText();
        this.groups.push({start: 0, end: pattern.length});
        for (let i = 0; i < pattern.length; ++i) {
            if (pattern[i] == '(') {
                stack.push(this.groups.length);
                this.groups.push({start: i, end: -1});
            } else if (pattern[i] == ')') {
                const startIndex = stack.pop();
                if (startIndex) {
                    this.groups[startIndex].end = i + 1;
                }
            }
        }
    }

    // TODO: (structure) move this function to the main element after adding highlight to input
    private generateColor = (colors: Array<string>, cnt: number): void => {
        for(let i = 0; i < cnt; ++ i) {
            colors.push(randomColor());
        }
    }

    public updateTestStatus = (result: string): void => {
        if (this.el.classList.contains(result)) {
            return;
        }
        if (this.el.classList.contains('Pass')) {
            this.el.classList.remove('Pass');
        }
        else if (this.el.classList.contains('Fail')) {
            this.el.classList.remove('Fail');
        }
        else if (this.el.classList.contains('Error')) {
            this.el.classList.remove('Error');
        }
        this.el.classList.add(result);
    }

    public removeFormat = (): void => {
        this.quill?.removeFormat(0, this.quill.getLength() - 1, 'silent');
    }

    public highlightError = (position: number): void => {
        this.quill?.formatText(position, 1, {
            'background': '#ff99b3'
        }, 'silent');
    }
}
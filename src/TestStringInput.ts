import Quill from 'quill';
import {randomColor} from 'randomcolor';
import { RegexEvent } from './LoggingEvents';
import Parchment from 'parchment';
// import {Quill} from '../types/Quill';

// experiments: wrapping classes
let Inline = Quill.import('blots/inline');

class GroupBlot extends Inline {
    static create(value: any){
        let node = super.create();
        node.setAttribute('class', 'group0');
        return node;
    }
    static formats(domNode: any) {
        return true;
    }
}
GroupBlot.blotName = 'grouping';
GroupBlot.className = 'group1';
GroupBlot.tagName = 'span';
Quill.register(GroupBlot);
// end of experiments

declare class RegexElement{
    logEvent(event: any): void;
    matchFindall: boolean;
    toolNumber: number;
}

export class TestStringInput implements ITestStringInput {
    // The input element
    public el: HTMLDivElement;
    public quill: Quill | null;
    public droppedText: boolean;
    public parentElement: RegexElement;
    public slotName: string;
    public highlightMode: string;

    constructor(slotName: string, parentElement: RegexElement) {
        this.parentElement = parentElement;
        this.el = document.createElement('div');
        this.slotName = slotName;
        this.el.id = 'regextool-' + this.parentElement.toolNumber + '-test-string-input' + slotName;
        this.el.classList.add('regex-test-string');
        this.quill = null;
        // console.log(Quill);
        this.droppedText = false;
        this.highlightMode = 're.finditer';
    }
    
    public initQuill = (): void => {
        // initializing quill
        this.quill = new Quill('#regextool-' + this.parentElement.toolNumber + '-test-string-input' + this.slotName, {
            modules: {
                toolbar: false
            },
            placeholder: 'type the test string',
        })
        this.quill.keyboard.addBinding({
                key:'C',
                shortKey: true,
            },
            (range, context) => {
                const testStringKeyboardEvent: RegexEvent.TestStringKeyboardEvent = {
                    'event-type': 'test-string-keyboard',
                    'slot': this.slotName,
                    range: range,
                    keys: ['ctrl', 'c'] 
                }
                if (this.parentElement) {
                    this.parentElement.logEvent(testStringKeyboardEvent);
                }
                return true;
            },
        );
        this.quill.keyboard.addBinding({
                key:'V',
                shortKey: true,
            },
            (range, context) => {
                const testStringKeyboardEvent: RegexEvent.TestStringKeyboardEvent = {
                    'event-type': 'test-string-keyboard',
                    'slot': this.slotName,
                    range: range,
                    keys: ['ctrl', 'v'] 
                }
                if (this.parentElement) {
                    this.parentElement.logEvent(testStringKeyboardEvent);
                }
                return true;
            },
        );
        this.el.ondrop = (event) => {
            this.droppedText = true;
            // console.log('ondrop');
            // console.log(event);
        }
    }

    public getText = (): string => {
        if (this.quill != null) {
            return this.quill.getText();
        } else {
            return '';
        }
    }

    public updateMatchResult = (matches: Array<string>): void => {
        this.quill?.removeFormat(0, this.quill.getLength() - 1, 'silent');
        let startPos: number = 0;
        let matchPos: number;
        const testString = this.getText();
        const formatLength: number = 37;
        for (let i: number = 0; i < matches.length; ++i) {
            matchPos = testString.indexOf(matches[i], startPos);
            startPos = matchPos + matches[i].length;
            this.quill?.formatText(matchPos, matches[i].length, {
                'background': 'rgb(251, 255, 130)'
            }, 'silent');
        }
    }

    // TODO: (UI) differentiate between different matches.
    // update match result with group info. Each group is a different color.
    public updateGroupedMatchResult = (matches: Array<Array<MatchGroup>>, colors: Array<string>): void => {
        this.quill?.removeFormat(0, this.quill.getLength() - 1, 'silent');
        if (matches.length == 0) {
            return;
        }

        // generate new colors for group if current colors are not enough
        const groupCount = matches[0].length;
        if (colors.length < groupCount) {
            this.generateColor(colors, groupCount - colors.length);
        }

        // highlight the matches in a group sequence such that inner groups' color will cover outer groups'.
        let index = 0;
        if (this.highlightMode == 're.findall') {
            if (this.parentElement?.matchFindall && groupCount > 1) {
                index = 1;
            }
        }
        for (index; index < groupCount; ++ index) {
            for (let j = 0; j < matches.length; ++ j) {
                this.quill?.formatText(matches[j][index].start, matches[j][index].end - matches[j][index].start, {
                    'background': colors[index]
                }, 'silent');
            }
        }
    }

    // update match result that does not has group info. Each match is a different color.
    public updateMatchResultNoGroup = (matches: Array<{st:number, ed: number}>, colors: Array<string>): void => {
        this.quill?.removeFormat(0, this.quill.getLength() - 1, 'silent');
        if (matches.length == 0) {
            return;
        }

        const groupCount = matches.length;
        if (colors.length < groupCount) {
            this.generateColor(colors, groupCount - colors.length);
        }

        // highlight the matches in a group sequence such that inner groups' color will cover outer groups'.
        let index = 0;
        for (index; index < matches.length; ++ index) {
            this.quill?.formatText(matches[index].st, matches[index].ed - matches[index].st, {
                'background': colors[index]
            }, 'silent');
        }
    }

    public updateGroupedMatchResult_exp = (matches: Array<Array<MatchGroup>>): void => {
        let i = 0;

            for (let j = 0; j < matches.length; ++ j) {
                this.quill?.formatText(matches[j][i].start, matches[j][i].end - matches[j][i].start, {
                    'grouping': true
                }, 'silent');
            }

    }

    // TODO: (structure) move this function to the main element after adding highlight to input
    private generateColor = (colors: Array<string>, cnt: number): void => {
        // const newcolors = randomColor({count: 10, luminosity: 'light'});
        // for(let i = 0; i < cnt; ++ i) {
        //     colors.push(newcolors[i]);
        // }
        let len = colors.length
        for (let i = len; i < len + cnt; ++i) {
            if (i % 2 == 0) {
                colors.push('#b0d4a9')
            } else {
                colors.push('#98d18c')
            }
        }
    }

    public setText(text: string) {
        this.quill?.setText(text);
    }
}

import Quill from 'quill';
import {randomColor} from 'randomcolor';
// import {Quill} from '../types/Quill';

export class TestStringInput implements ITestStringInput {
    // The input element
    public el: HTMLDivElement;
    public quill: Quill | null;

    constructor() {
        this.el = document.createElement('div');
        this.el.id = 'test-string-input'
        this.quill = null;
        // console.log(Quill);
    }
    
    public initQuill = (): void => {
        // initializing quill
        this.quill = new Quill('#test-string-input', {
            modules: {
                toolbar: false
            },
            placeholder: 'type the test string',
            theme: 'bubble',
        })
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

    // TODO: (UI) differentiate between different matches
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
        for (let i = 0; i < groupCount; ++ i) {
            for (let j = 0; j < matches.length; ++ j) {
                this.quill?.formatText(matches[j][i].start, matches[j][i].end - matches[j][i].start, {
                    'background': colors[i]
                }, 'silent');
            }
        }
    }

    // TODO: (structure) move this function to the main element after adding highlight to input
    private generateColor = (colors: Array<string>, cnt: number): void => {
        for(let i = 0; i < cnt; ++ i) {
            colors.push(randomColor());
        }
    }

}
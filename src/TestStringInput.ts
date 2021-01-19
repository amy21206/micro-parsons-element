import Quill from 'quill';
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
        let startPos: number = 0;
        let matchPos: number;
        const testString = this.getText();
        const formatLength: number = 37;
        for (let i: number = 0; i < matches.length; ++i) {
            matchPos = testString.indexOf(matches[i], startPos);
            startPos = matchPos + matches[i].length;
            this.quill?.formatText(matchPos, matches[i].length, {
                'background': 'rgb(251, 255, 130)'
            });
        }
    }

}
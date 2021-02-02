import Quill from 'quill';
import {randomColor} from 'randomcolor';

export class RegexInput implements IRegexInput {
    // The input element
    public el: HTMLDivElement;
    public quill: Quill | null;
    private groups: Array<PatternGroup>;
    constructor() {
        this.el = document.createElement('div');
        this.el.id = 'regex-input'
        
        this.quill = null;
        
        this.groups = new Array<PatternGroup>();

        // this.el.classList.add('regex-textbox')
        // this.el.setAttribute("rows", "1");
    }
    
    public initQuill = (): void => {
        // initializing quill
        this.quill = new Quill('#regex-input', {
            modules: {
                toolbar: false
            },
            theme: 'bubble',
        })
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
        // highlight the groups
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
}
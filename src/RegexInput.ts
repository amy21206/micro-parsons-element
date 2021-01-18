export class RegexInput implements IRegexInput {
    // The input element
    public el: HTMLTextAreaElement;
    constructor() {
        this.el = document.createElement('textarea');
        this.el.id = 'regex-input'
        this.el.classList.add('regex-textbox')
        this.el.setAttribute("rows", "1");
    }
}
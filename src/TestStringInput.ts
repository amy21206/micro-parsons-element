export class TestStringInput implements ITestStringInput {
    // The input element
    public el: HTMLTextAreaElement;
    constructor() {
        this.el = document.createElement('textarea');
        this.el.id = 'test-string-input'
        this.el.classList.add('regex-textbox')
        this.el.setAttribute("rows", "10");
    }
}
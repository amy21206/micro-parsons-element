export class StatusOutput implements IStatusOutput {
    // The input element
    public el: HTMLDivElement;
    public text: HTMLTextAreaElement;
    constructor() {
        this.el = document.createElement('div');
        this.text = document.createElement('textarea');
        this.el.appendChild(this.text);
        this.text.id = 'status-output';
        this.el.classList.add('regex-textbox');
        // this.text.setAttribute("rows", "10");

        this.text.value = 'initializing...\n';
    }
}
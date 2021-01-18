export class StatusOutput implements IStatusOutput {
    // The input element
    public el: HTMLTextAreaElement;
    constructor() {
        this.el = document.createElement('textarea');
        this.el.id = 'status-output'
        this.el.classList.add('regex-textbox')
        this.el.setAttribute("rows", "10");

        this.el.value = 'initializing...\n';
    }
}
export class TestButton implements ITestButton {
    // The input element
    public el: HTMLButtonElement;
    constructor() {
        this.el = document.createElement('button');
        this.el.id = 'test-string-input'
    }
}
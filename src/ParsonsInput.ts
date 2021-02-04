export class ParsonsInput implements IParsonsInput {
    // The input element
    public el: HTMLDivElement;
    constructor() {
        this.el = document.createElement('div');
        this.el.id = 'parsons-input'
    }
}
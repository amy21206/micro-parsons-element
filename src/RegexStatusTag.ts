declare class RegexElement {
    public toolNumber: number;
}

export class RegexStatusTag implements IRegexStatusTag {
    // The input element
    public el: HTMLSpanElement;
    public status: string;

    private parentElement: RegexElement;

    constructor(parentElement: RegexElement) {

        this.parentElement = parentElement;

        this.el = document.createElement('span');
        this.el.classList.add('regex-status');
        
        this.status = '';
        
    }
    
    public updateStatus = (status: string): void => {
        // currently supporting: '', 'error', 'valid'
        this.el.innerText = 'pattern ' + status;
        if (status === '') {
            if (this.el.classList.contains('error')) {
                this.el.classList.remove('error');
            } else if (this.el.classList.contains('valid')) {
                this.el.classList.remove('valid');
            }
        } else if (this.el.classList.contains(status)) {
            return;
        } else {
            if (this.el.classList.contains('error')) {
                this.el.classList.remove('error');
            } else if (this.el.classList.contains('valid')) {
                this.el.classList.remove('valid');
            }
            this.el.classList.add(status);
        }
    }
}
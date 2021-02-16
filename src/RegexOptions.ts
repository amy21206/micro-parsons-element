export class RegexOptions implements IRegexOptions {
    public el: HTMLDivElement;
    private triggerButton: HTMLButtonElement;
    private containerDiv: HTMLDivElement;
    private flags: Array<string>;
    private buttons: Array<HTMLButtonElement>;
    private selectedFlags: Array<string>;

    constructor() {
        this.el = document.createElement('div');
        this.el.classList.add('regex-options-dropdown');

        this.triggerButton = document.createElement('button');
        this.triggerButton.classList.add('regex-options-dropdown-btn');
        this.triggerButton.innerText = 'Flags:\n';
        this.el.appendChild(this.triggerButton);
        this.containerDiv = document.createElement('div');
        this.el.appendChild(this.containerDiv);

        this.containerDiv.classList.add('regex-options-container');
        this.flags = ['re.MULTILINE', 're.ASCII', 're.IGNORECASE', 're.LOCALE', 're.DOTALL'];
        const defaultFlags = [0];
        this.selectedFlags = [];

        this.buttons = [];
        for (let flag = 0; flag < this.flags.length; ++ flag) {
            let newButton = document.createElement('button');
            this.buttons.push(newButton);
            this.containerDiv.appendChild(newButton);
            newButton.innerText = this.flags[flag];
            newButton.onclick = () => {
                newButton.classList.toggle('selected');
                this.updateButton();
            };
            if (defaultFlags.indexOf(flag) != -1) {
                newButton.classList.add('selected');
            }
        }
        this.updateButton();
        
        this.triggerButton.onclick = this.onTriggerButtonClicked;
    }

    public getFlags = (): string | null => {
        let flags = '';
        this.buttons.forEach(button => {
            if(button.classList.contains('selected')) {
                flags += button.innerText + ' | ';
            }
        })
        if (flags == '') {
            return null;
        } else {
            return flags.slice(0, -3);
        }
    }

    private onTriggerButtonClicked = (): void => {
        this.containerDiv.classList.toggle('show');
    }

    private updateButton = (): void => {
        let flags = '';
        this.buttons.forEach(button => {
            if(button.classList.contains('selected')) {
                flags += button.innerText[3];
            }
        })
        this.triggerButton.innerText = 'Flags: ' + flags;
    }

    
}
export class MPBlock extends HTMLElement{

    static count: number = 0;

    constructor(){
        super();
    }

    connectedCallback() {
        if (!this.id) {
            // not sure if this is needed
            this.id = `mp-block-${MPBlock.count++}`;
        }
    }

    public getBlockText(): string {
        // return all text content except for the ones that are <mp-block-exp>
        let text = "";
        let child = this.firstChild;
        do {
            // if child exists and is not an mp-block-exp element
            if (child && !(child.nodeType == Node.ELEMENT_NODE && (child as Element).tagName == "MP-BLOCK-TTP")) { // add text and move on to next sibling 
                text += child.textContent;
            }
            child = child!.nextSibling;
        } while (child)
        return text;
    }

    public getTooltipText(): string | null {
        // return all text content except for the ones that are <mp-block-exp>
        let mpexp = this.querySelector('MP-BLOCK-TTP');
        if (mpexp) {
            return mpexp.textContent;
        } else {
            return null;
        }
    }
}

// block tooltip
export class MPBlockTtp extends HTMLElement{

    static count: number = 0;

    constructor(){
        super();
    }

    connectedCallback() {
        if (!this.id) {
            // not sure if this is needed
            this.id = `mp-block-ttp-${MPBlockTtp.count++}`;
        }
    }
}
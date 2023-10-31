export class MPContext extends HTMLPreElement {

    static count: number = 0;

    constructor() {
        super();
    }
    
    connectedCallback() {
        if (!this.id) {
            this.id = `mp-context-${MPContext.count++}`;
        }
        // this.innerHTML = `<pre>${this.innerHTML}</pre>`;
        setTimeout(() => {
            // now runs asap 
            console.log("connected");
        });
    }
}

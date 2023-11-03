export class MPContext extends HTMLElement {

    static count: number = 0;

    constructor() {
        super();
    }
    
    connectedCallback() {
        if (!this.id) {
            this.id = `mp-context-${MPContext.count++}`;
        }
        // this.innerHTML = `<div>${this.innerHTML}</div>`
        // turn inside text nodes to div wrapped nodes
        let children = this.childNodes;
        for (let i = 0; i < children.length; ++i) {
            let child = children[i];
            if (child.nodeType == Node.TEXT_NODE && child.textContent) {
                // TODO: test more edge cases on this
                let divNode = document.createElement('div');
                let lines = child.textContent.split('\n');
                if (lines.length > 2) {
                    // somehow there's extra blank lines before and after
                    lines = child.textContent.split('\n').slice(1, -1);
                    divNode.innerHTML = lines.join('\n');
                    this.insertBefore(divNode, child);
                }
                // if all blank:
                this.removeChild(child);
            }
        }

        if (this.hasAttribute('subgoal')) {
            // if has subgoal: split the first node to have a seprate subgoal div
            const subgoalLineCount = parseInt(this.getAttribute('subgoal-line-count') || '1');
            const firstChild = this.firstChild as HTMLDivElement;
            let lines = firstChild.innerHTML.split('\n');
            console.log(lines)
            const subgoalLines = lines.slice(0, subgoalLineCount).join('\n');
            const subgoalDiv = document.createElement('div');
            subgoalDiv.innerHTML = subgoalLines;
            subgoalDiv.classList.add('subgoal');
            this.insertBefore(subgoalDiv, firstChild);

            // note: now the firstChild is actually in the 2nd place
            if (subgoalLineCount < lines.length) {
                // if there is extra code after, update the text in that div
                const codeLines = lines.slice(subgoalLineCount).join('\n');
                firstChild.innerHTML = codeLines;
            } else {
                // else, remove the div
                this.removeChild(firstChild);
            }
        }

        // // if is a subgoal: add subgoal class that enables slidetoggle
        // if (this.hasAttribute('subgoal')) {
        //     this.classList.add('subgoal');
        //     // this.onclick = () => this._subgoalOnClick();
        // }
    }

    private _subgoalOnClick() {
        if (!this.classList.contains('expanded')) {
            this.classList.add('expanded');
            // not sure what the following lines do
            this.style.height = 'auto';
            let height = this.clientHeight + 'px';
            this.style.height = '0px';
            setTimeout(() => {
                this.style.height = height;
            }, 0);
        } else {
            //also not sure why this
            this.style.height = '0px';
            this.addEventListener('transitionend', () => {
                this.classList.remove('expanded');
            }, {once: true});
        }
    }
}

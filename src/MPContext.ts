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
                divNode.classList.add('code');
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
            // add class for slid hiding/showing
            this.classList.add('context-subgoal');
            // if has subgoal: split the first node to have a seprate subgoal div
            const subgoalLineCount = parseInt(this.getAttribute('subgoal-line-count') || '1');
            const firstChild = this.firstChild as HTMLDivElement;
            let lines = firstChild.innerHTML.split('\n');
            const subgoalLines = lines.slice(0, subgoalLineCount).join('\n');
            const subgoalDiv = document.createElement('div');
            subgoalDiv.innerHTML = subgoalLines;
            subgoalDiv.classList.add('subgoal');
            this.insertBefore(subgoalDiv, firstChild);

            // if there is extra code after, update the text in that div
            const codeLines = lines.slice(subgoalLineCount).join('\n');
            firstChild.innerHTML = codeLines;
            firstChild.style.display = 'none';
            subgoalDiv.onclick = (ev) => this._subgoalOnClick(ev);

            subgoalDiv.click();

            // // enclose all other siblings in one div if there are other content inside the subgoal
            // // seems like it's always the case?
            // if (this.children.length > 1) {
            //     let childDiv = document.createElement('div');
            //     childDiv.classList.add('subgoal-content')
            //     while (this.childNodes.length > 0) {
            //         childDiv.appendChild(this.childNodes[0]);
            //     }
            //     this.appendChild(childDiv.firstChild!);
            //     this.appendChild(childDiv);
            // }
        }

        // // if is a subgoal: add subgoal class that enables slidetoggle
        // if (this.hasAttribute('subgoal')) {
        //     // this.onclick = () => this._subgoalOnClick();
        // }
    }

    // called on subgoal div inside the context
    private _subgoalOnClick(ev:Event) {
        let subgoalDiv = (ev.target as HTMLDivElement);
        let action = '';
        if (subgoalDiv.classList.contains('collapsed')) {
            subgoalDiv.classList.remove('collapsed');
            // (subgoalDiv.nextSibling as HTMLDivElement).style.display = '';
            action = 'expand';
        } else {
            subgoalDiv.classList.add('collapsed');
            action = 'collapse';
            // (subgoalDiv.nextSibling as HTMLDivElement).style.display = 'none';
        }
        let sibling = subgoalDiv.nextSibling;
        while (sibling) {
            if (action == 'expand') {
                (sibling as HTMLElement).style.display = '';
            } else {
                // action == collapse
                (sibling as HTMLElement).style.display = 'none';
            }
            sibling = sibling.nextSibling;
        }
        // if (!this.classList.contains('expanded')) {
        //     console.log('adding expanded')
        //     this.classList.add('expanded');
        //     // not sure what the following lines do
        //     this.style.height = 'auto';
        //     let height = this.clientHeight + 'px';
        //     this.style.height = '0px';
        //     setTimeout(() => {
        //         this.style.height = height;
        //     }, 0);
        // } else {
        //     console.log('removing expanded')
        //     //also not sure why this
        //     this.style.height = '0px';
        //     this.classList.remove('expanded');
        // }
    }
}

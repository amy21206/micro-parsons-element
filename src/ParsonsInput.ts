import { ParsonsBlock } from './ParsonsBlock';

export class ParsonsInput implements IParsonsInput {
    // The input element
    public el: HTMLDivElement;
    private dropZone: HTMLDivElement;
    private dragZone: HTMLDivElement;
    private sourceBlocks: Array<ParsonsBlock>;
    private targetBlocks: Array<ParsonsBlock>;
    constructor() {
        this.el = document.createElement('div');
        this.el.id = 'parsons-input'

        this.dropZone = document.createElement('div');
        this.dropZone.style.height = '20px';
        this.dropZone.style.width = '500px';
        this.dropZone.style.backgroundColor = '#a6e3ca';
        this.el.appendChild(this.dropZone);
        this.dropZone.ondragover = this.onDragOver;
        this.dropZone.ondrop = this.onDropToDropArea;

        this.dragZone = document.createElement('div');
        this.dragZone.style.width = '500px';
        this.dragZone.style.padding = '10px';
        this.dragZone.style.backgroundColor = '#e3daa6';
        this.el.appendChild(this.dragZone);

        this.sourceBlocks = new Array<ParsonsBlock>();
        for (let i = 0; i < 3; ++ i) {
            let newBlock = new ParsonsBlock();
            this.dragZone.appendChild(newBlock.el);
            newBlock.parsonsText = 'block' + i.toString();
            this.sourceBlocks.push(newBlock);
        }

        this.targetBlocks = new Array<ParsonsBlock>();
    }

    private onDragOver = (event: DragEvent): void => {
        event.preventDefault();
        this.dropZone.style.backgroundColor = 'blue';
    }

    private onDropToDropArea = (event: DragEvent): void => {
        // this.dropZone.appendChild() = 'blue';
        const newBlock = new ParsonsBlock();
        this.dropZone.appendChild(newBlock.el);
        this.targetBlocks.push(newBlock);
        newBlock.isSource = false;
        newBlock.parsonsText = event.dataTransfer?.getData('text/plain') || '';
    }
}
import { MPBlock } from "./MPBlock";
import { ParsonsInput } from "./ParsonsInput";
import { MicroParsonsElement } from "./micro-parsons";

export class MPLine extends HTMLElement{

    static count: number = 0;

    // not sure if this should be public... trying to get it to work
    public hparsonsInput: ParsonsInput | null;

    private _inputDiv: HTMLDivElement;
    private _language: string | null;
    private _reusable: boolean;
    private _randomize: boolean;

    constructor(){
        super();
        this.hparsonsInput = null;
        this._inputDiv = document.createElement('div');
        this._language = null;
        this._reusable = false;
        this._randomize = true;
    }

    connectedCallback() {
        if (!this.id) {
            this.id = `mp-line-${MPLine.count++}`;
        }
        this.appendChild(this._inputDiv);
        
        const indentation:number = parseInt(this.getAttribute('indentation') || '0');
        this._language = this._getParentMP().language; 

        this._reusable = this.getAttribute('reuse') ? true : false;
        this._randomize = this.getAttribute('randomize') ? true : false;

        this.hparsonsInput = new ParsonsInput(this._getParentMP(), this._reusable, this._randomize, this._inputDiv);
        this.hparsonsInput.el.style.paddingLeft = (indentation * 4).toString();

        this.hparsonsInput.setSourceBlocks(this._getBlocksAsStringList(), this._getTooltipsAsStringList());
    }

    private _getParentMP() {
        return this.closest('micro-parsons') as MicroParsonsElement;
    }

    // TODO: right now just giving all blocks, no explanation, regardless of distractor, not storing correctness
    private _getBlocksAsStringList(): string[] {
        const blocks = this.querySelectorAll('mp-block');
        let blocksAsStringList: string[] = [];
        for (let i = 0; i < blocks.length; ++i) {
            // when to specify feedback and how?
            blocksAsStringList.push((blocks[i] as MPBlock).getBlockText());
        }
        return blocksAsStringList;
    }

    // TODO: right now just giving all blocks, no explanation, regardless of distractor, not storing correctness
    private _getTooltipsAsStringList(): string[] | null {
        const blocks = this.querySelectorAll('mp-block');
        let tooltipsAsStringList: string[] = [];
        let hasTooltip = false;
        for (let i = 0; i < blocks.length; ++i) {
            // when to specify feedback and how?
            const tooltip = (blocks[i] as MPBlock).getTooltipText();
            if (tooltip) {
                hasTooltip = true;
                tooltipsAsStringList.push(tooltip);
            } else {
                tooltipsAsStringList.push('');
            }
        }
        if (hasTooltip) {
            return tooltipsAsStringList;
        } else {
            return null;
        }
    }
}
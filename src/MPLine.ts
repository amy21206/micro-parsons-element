import { MPBlock } from "./MPBlock";
import { MPContext } from "./MPContext";
import { ParsonsInput } from "./ParsonsInput";
import { MicroParsonsElement } from "./micro-parsons";

export class MPLine extends HTMLElement{

    static count: number = 0;

    // not sure if this should be public... trying to get it to work
    public hparsonsInput: ParsonsInput | null;

    // InputDiv contains the ParsonsInput
    private _inputDiv: HTMLDivElement;
    // textDiv is a text entry alternative
    private _textDiv: HTMLDivElement;
    private _language: string | null;
    private _reusable: boolean;
    private _randomize: boolean;

    static _singleIndentWidth: number = this._calcSingleIndentWidth();
    
    private _checkBtn: HTMLButtonElement;
    private _resetBtn: HTMLButtonElement;

    private originalBlocks: string[];

    constructor(){
        super();
        this.hparsonsInput = null;
        this._inputDiv = document.createElement('div');
        this._textDiv = document.createElement('div');
        this._textDiv.contentEditable = 'true';
        this._textDiv.classList.add('mp-line-text');
        this._textDiv.spellcheck = false;

        const toggleDiv = document.createElement('div');
        toggleDiv.innerHTML = 
        `<label class="mp-switch">
            <span class="mp-switch-text">Help</span>
            <input type="checkbox" checked>
            <span class="mp-slider"></span>
        </label>`;
        this.appendChild(toggleDiv);
        toggleDiv.classList.add('mp-line-toggle-container')
        toggleDiv.querySelector('input')!.onclick = () => this.toggleParsonsText();

        this.appendChild(this._inputDiv);
        this.appendChild(this._textDiv);

        toggleDiv.querySelector('input')!.click();

        this._language = null;
        this._reusable = false;
        this._randomize = true;
        
        if (!this.id) {
            this.id = `mp-line-${MPLine.count++}`;
        }

        
        this._language = this._getParentMP().language; 

        const indentation:number = parseInt(this.getAttribute('indentation') || '0');
        const context:MPContext | null = this._getParentMP().querySelector('mp-context');
        // const contextFontSize = context ? parseInt(context.style.fontSize.slice(0, context.style.fontSize.length - 2)) : 15;
        // console.log('hello??')
        // console.log(indentation)
        // console.log(contextFontSize)
        // this.style.marginLeft = `${indentation * 4 * contextFontSize}px`;
        this.style.marginLeft = `${MPLine._singleIndentWidth * indentation}px`;
        console.log(`${MPLine._singleIndentWidth * indentation}px`);
        console.log(this.style.marginLeft);

        this._reusable = this.getAttribute('reuse') != null ? true : false;
        this._randomize = this.getAttribute('randomize') != null ? true : false;

        this.hparsonsInput = new ParsonsInput(this._getParentMP(), this._reusable, this._randomize, this._inputDiv);

        this.originalBlocks = this._getBlocksAsStringList();
        this.hparsonsInput.setSourceBlocks(this._getBlocksAsStringList(), this._getTooltipsAsStringList());
        this.hparsonsInput.setBlockAnswer(this.getBlockAnswer());
        this._checkBtn = document.createElement('button');
        this._checkBtn.innerText = "Check Me";
        this._checkBtn.classList.add('check-me-btn');
        this._resetBtn = document.createElement('button');
        this._resetBtn.innerText = "Reset";
        this._resetBtn.classList.add('reset-btn');
        this.append(this._checkBtn);
        this.append(this._resetBtn);
    }

    // toggle the visibility of text and parsons div
    public toggleParsonsText() {
        if (this.classList.contains('mparsons-hidden')) {
            this.classList.remove('mparsons-hidden');
        } else {
            this.classList.add('mparsons-hidden');
        }
    }

    connectedCallback() {
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

    static _calcSingleIndentWidth() {
        let singleIndentDiv = document.createElement('div');
        // any 4 characters: the indentation is 4 letters, hardcoded (TODO: change to options)
        singleIndentDiv.innerText = 'abcd';
        singleIndentDiv.style.position = 'absolute';
        singleIndentDiv.style.float = 'left';
        singleIndentDiv.style.fontFamily = 'monospace';
        singleIndentDiv.style.fontSize = '15px';
        // singleIndentDiv.style.visibility = 'hidden';
        document.querySelector('body')!.appendChild(singleIndentDiv);
        // this.appendChild(singleIndentDiv);
        console.log(singleIndentDiv);

        const width = singleIndentDiv.clientWidth;
        console.log(width);
        singleIndentDiv.remove();
        return width;
    }

    private getBlockAnswer(): Array<number> {
        const blockAnswer = [];
        const blocks = this.querySelectorAll('mp-block');
        for (let i = 0; i < blocks.length; ++i) {
            // when to specify feedback and how?
            console.log(blocks[i])
            if (!(blocks[i] as MPBlock).hasAttribute('distractor')) {
                blockAnswer.push(i);
            }
            console.log(blockAnswer)
        }
        console.log('final', blockAnswer)
        return blockAnswer;
    }
}
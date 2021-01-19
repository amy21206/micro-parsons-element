import {languagePluginLoader} from './external/pyodide';
import {RegexInput} from './RegexInput';
import {TestStringInput} from './TestStringInput';
import { StatusOutput } from './StatusOutput';
import { TestButton } from './TestButton';
import { TestResult } from './TestResult';

// import {pyodide} from '../types/pyodide';

declare global {
    interface Window {
        languagePluginUrl: string
        pyodide: Pyodide
    }
}

export class TestElement extends HTMLElement {
    public regexInput: RegexInput;
    public testStringInput: TestStringInput;
    public statusOutput: StatusOutput;
    public testButton: TestButton;
    // public testResult: TestResult;
    private checkWhileTyping: boolean;
    private prevText: string;
    constructor() {
        super();
        window.languagePluginUrl = 'https://cdn.jsdelivr.net/pyodide/v0.16.1/full/';
        
        this.addStyle();

        this.testButton = new TestButton();
        this.appendChild(this.testButton.el);
        this.testButton.el.onclick = this.match;

        const checkbox = document.createElement('input');
        checkbox.setAttribute('type', 'checkbox');
        checkbox.checked = false;
        this.appendChild(checkbox);
        this.append('always check on test string input');
        this.checkWhileTyping = false;
        checkbox.addEventListener('change', ()=>{
            this.checkWhileTyping = checkbox.checked;
            if (this.checkWhileTyping) {
                this.match();
            }
        })

        this.regexInput = new RegexInput();
        this.appendChild(this.regexInput.el);

        const quillLinkRef = document.createElement('link');
        quillLinkRef.href = 'https://cdn.quilljs.com/1.3.7/quill.bubble.css';
        quillLinkRef.rel = 'stylesheet';
        this.appendChild(quillLinkRef);

        this.testStringInput = new TestStringInput();
        this.appendChild(this.testStringInput.el);
        this.testStringInput.initQuill();
        this.prevText = this.testStringInput.getText();
        this.testStringInput.quill?.on('text-change', () => {
            if (this.testStringInput.getText() != this.prevText) {
                this.prevText = this.testStringInput.getText();
                this.testStringInput.quill?.removeFormat(0, this.testStringInput.quill.getLength() - 1, 'silent');
                if (this.checkWhileTyping) {
                    this.match();
                }
            }
        })

        this.statusOutput = new StatusOutput();
        this.appendChild(this.statusOutput.el);
        this.initPyodide();

        // this.testResult = new TestResult();
        // this.appendChild(this.testResult.el);

        this.checkWhileTyping = false;
    }

    private initPyodide = (): void => {
        languagePluginLoader.then(() => {
            this.statusOutput.el.value += "Init finished.\n";
        });
    }

    private addStyle = (): void => {
        const sheet = document.createElement('style');
        sheet.innerHTML += '.regex-textbox {width: 100%;}\n';
        document.body.appendChild(sheet); 
    }

    public match = (): void => {
      this.statusOutput.el.value=''
      const pydata='import re\n' + 'pattern="' + this.regexInput.el.value + '"\n' + 'source="""' + this.testStringInput.getText() + '"""\n' + 're.findall(pattern,source)'
    //   console.log(pydata);
      window.pyodide.runPythonAsync(pydata)
        .then(output => {
            this.addToOutput(output);
            this.testStringInput.updateMatchResult(output);
            // this.testResult.updateResult(output, this.testStringInput.getText());
            // console.log(output);
        })
        .catch((err) => { this.addToOutput(err) });
    }

    private addToOutput = (s: string): void => {
      this.statusOutput.el.value += '>>>' + this.regexInput.el.value + '\n' + s + '\n';
    }
}

customElements.define('test-element', TestElement);
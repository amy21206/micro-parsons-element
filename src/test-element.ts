import { languagePluginLoader } from './external/pyodide';
import { RegexInput } from './RegexInput';
import { TestStringInput } from './TestStringInput';
import { StatusOutput } from './StatusOutput';
import { TestButton } from './TestButton';

declare global {
    interface Window {
        languagePluginUrl: string
        pyodide: Pyodide
    }
}

// Custom element of regex matching
export class RegexElement extends HTMLElement {

    // The input box for regex pattern
    public regexInput: RegexInput;

    // The input box for test string (with highlight)
    public testStringInput: TestStringInput;

    // Python output
    public statusOutput: StatusOutput;

    // The button to trigger matching
    public testButton: TestButton;

    // *temporary: The checkbox to enable always check (will be integrated in options later)
    private checkWhileTyping: boolean;

    // Saving previous checked text, used with checkWhileTyping
    private prevText: string;

    constructor() {
        super();

        // init pyodide
        // window.languagePluginUrl = 'https://cdn.jsdelivr.net/pyodide/v0.16.1/full/';
        window.languagePluginUrl = 'http://127.0.0.1:8081/pyodide/';
        
        // add style
        this.addStyle();

        // init elements: button
        this.testButton = new TestButton();
        this.appendChild(this.testButton.el);
        this.testButton.el.onclick = this.match;

        // init elements: checkbox
        // TODO[feature]: replace this with an option module 
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

        // init elements: regex input
        this.regexInput = new RegexInput();
        this.appendChild(this.regexInput.el);

        // init elements: test string input
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

        // init element: python output
        this.statusOutput = new StatusOutput();
        this.appendChild(this.statusOutput.el);
        this.initPyodide();
    }

    // Initializes Pyodide
    // ref: https://pyodide.readthedocs.io/en/latest/usage/quickstart.html
    private initPyodide = (): void => {
        languagePluginLoader.then(() => {
            this.statusOutput.el.value += "Init finished.\n";
        });
    }

    // TODO[refactor]: put stylesheet in a separate css/scss file
    private addStyle = (): void => {
        const sheet = document.createElement('style');
        sheet.innerHTML += '.regex-textbox {width: 100%;}\n';
        document.body.appendChild(sheet); 
    }

    /**
     * Runs re.findall() with data from regex and test string input;
     * Highlights the result in the test string input;
     * Prints python output.
    */
    public match = (): void => {
      this.statusOutput.el.value=''
      const pydata='import re\n' + 'pattern="' + this.regexInput.el.value + '"\n' + 'source="""' + this.testStringInput.getText() + '"""\n' + 're.findall(pattern,source)'
      window.pyodide.runPythonAsync(pydata)
        .then(output => {
            this.addToOutput(output);
            this.testStringInput.updateMatchResult(output);
        })
        .catch((err) => { this.addToOutput(err) });
    }

    private addToOutput = (s: string): void => {
      this.statusOutput.el.value += '>>>' + this.regexInput.el.value + '\n' + s + '\n';
    }
}

customElements.define('regex-element', RegexElement);
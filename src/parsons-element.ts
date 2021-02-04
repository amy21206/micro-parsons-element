import { ParsonsInput } from './ParsonsInput';
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

export class ParsonsElement extends HTMLElement {
    
    private root: ShadowRoot;

    private _parsonsData: Array<string>;
    private parsonsInput: ParsonsInput;

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

    private matchResult: Array<Array<MatchGroup>>;

    // random color representations for groups
    public groupColor: Array<string>;

    constructor() {
        super();

        this.root = this.attachShadow({mode: 'open'});

        // init pyodide
        // window.languagePluginUrl = 'https://cdn.jsdelivr.net/pyodide/v0.16.1/full/';
        window.languagePluginUrl = 'http://127.0.0.1:8081/pyodide/';

        // add style
        this.addStyle();

        // init elements: button
        this.testButton = new TestButton();
        this.root.appendChild(this.testButton.el);
        this.testButton.el.onclick = this.match;

        // init elements: checkbox
        // TODO[feature]: replace this with an option module 
        const checkbox = document.createElement('input');
        checkbox.setAttribute('type', 'checkbox');
        checkbox.checked = false;
        this.root.appendChild(checkbox);
        this.root.append('always check on test string input');
        this.checkWhileTyping = false;
        checkbox.addEventListener('change', () => {
            this.checkWhileTyping = checkbox.checked;
            if (this.checkWhileTyping) {
                this.match();
            }
        })

        this._parsonsData = new Array<string>();

        // init elements: parsons regex input
        this.parsonsInput = new ParsonsInput();
        this.root.appendChild(this.parsonsInput.el);

        // init elements: test string input
        // TODO: (bug) stylesheet isn't working with shadowroot
        const quillLinkRef = document.createElement('link');
        quillLinkRef.href = 'https://cdn.quilljs.com/1.3.7/quill.bubble.css';
        quillLinkRef.rel = 'stylesheet';
        this.root.appendChild(quillLinkRef);

        const slot = document.createElement('slot');
        slot.name = 'test-string-input'
        this.root.appendChild(slot);

        this.testStringInput = new TestStringInput();
        this.appendChild(this.testStringInput.el);
        this.testStringInput.el.slot = 'test-string-input';
        this.testStringInput.initQuill();
        this.prevText = this.testStringInput.getText();
        this.testStringInput.quill?.on('text-change', () => {
            if (this.testStringInput.getText() != this.prevText) {
                this.prevText = this.testStringInput.getText();
                // updating test_string in pyodide
                window.pyodide.globals.test_string = this.testStringInput.getText().slice(0, -1);
                if (this.checkWhileTyping) {
                    this.match();
                } else {
                    this.testStringInput.quill?.removeFormat(0, this.testStringInput.quill.getLength() - 1, 'silent');
                }
            }
        })

        // init element: python output
        this.statusOutput = new StatusOutput();
        this.root.appendChild(this.statusOutput.el);
        this.initPyodide();

        // initialize the match result array
        this.matchResult = new Array<Array<MatchGroup>>();

        // initialize the color array
        this.groupColor = new Array<string>();
    }

    set parsonsData(data: Array<string>) {
        this._parsonsData = data;
        this.parsonsInput.setSourceBlocks(data);
    }

    get parsonsData(): Array<string> {
        return this._parsonsData;
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
        sheet.innerHTML += '.parsons-selected {background-color: red;}\n';
        sheet.innerHTML += '.parsons-block {display: inline-block; font-family: monospace; font-size: large; background-color: white; padding: 0 3px 0 3px;}\n';
        // sheet.innerHTML += '.parsons-block:hover, .parsons-block:focus { border:solid ;}\n';
        document.body.appendChild(sheet);
        this.root.appendChild(sheet);
    }

    /**
     * Runs re.findall() with data from regex and test string input;
     * Highlights the result in the test string input;
     * Prints python output.
    */
    public match = (): void => {
        this.statusOutput.el.value = ''
        let pydata = 'import re\n';
        window.pyodide.globals.regex_input = this.parsonsInput.getText();
        pydata += 'pattern = re.compile(regex_input)\n';
        pydata += 'source = test_string\n';
        pydata += 'global match_result\n';
        pydata += 'match_result = []\n';
        // TODO: (performance)try to reduce assigning data here
        pydata += 'for match_obj in re.finditer(pattern, source):\n';
        pydata += '    match_data = []\n';
        pydata += '    match_result.append(match_data)\n';
        pydata += '    for group_id in range(pattern.groups + 1):\n';
        pydata += '        group_data = {}\n';
        pydata += '        match_data.append(group_data)\n';
        pydata += '        group_data[\'group_id\'] = group_id\n';
        pydata += '        group_data[\'start\'] = match_obj.start(group_id)\n';
        pydata += '        group_data[\'end\'] = match_obj.end(group_id)\n';
        pydata += '        group_data[\'data\'] = match_obj.group(group_id)\n';
        pydata += '    for name, index in pattern.groupindex.items():\n';
        pydata += '        match_data[index][\'name\'] = name\n';
        window.pyodide.runPythonAsync(pydata)
            .then(_ => {
                // TODO: (robustness)test edge cases with no match
                this.matchResult = window.pyodide.globals.match_result as Array<Array<MatchGroup>>;
                this.addMatchResultToOutput();
                // TODO: (feature)fix highlighting with group information
                this.testStringInput.updateGroupedMatchResult(this.matchResult, this.groupColor);
                // this.testStringInput.updateGroupedMatchResult_exp(this.matchResult);
            })
            .catch((err) => { this.addTextToOutput(err) });
    }

    private addToOutput = (originalOutput: Array<string | Array<string>>): void => {
        let output = '';
        originalOutput.forEach(element => {
            output += '(' + element.toString() + '),';
        });
        this.statusOutput.el.value += '>>>' + this.parsonsInput.getText() + '\n' + output + '\n';
    }
    
    private addTextToOutput = (output: string): void => {
        this.statusOutput.el.value += '>>>' + this.parsonsInput.getText() + '\n' + output + '\n';
    }

    private addMatchResultToOutput = (): void => {
        let output = '';
        for(let i = 0; i < this.matchResult.length; ++i) {
            output += 'Match ' + i.toString() + ':\n';
            for(let j = 0; j < this.matchResult[i].length; ++j ) {
                output += 'Group ' + j.toString() + ': ';
                output += this.matchResult[i][j].data + ' span(' + this.matchResult[i][j].start + ', ' + this.matchResult[i][j].end + ') ';
                if (this.matchResult[i][j].name) {
                    output += this.matchResult[i][j].name;
                } 
                output += '\n';
            }
            output += '\n';
        }
        this.statusOutput.el.value += '>>>\n' + output;
    }
}

customElements.define('parsons-element', ParsonsElement);
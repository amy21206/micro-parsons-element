export class TestResult implements ITestResult {
    // The input element
    public el: HTMLDivElement;
    constructor() {
        this.el = document.createElement('div');
        this.el.id = 'test-result'
        this.addStyle();
    }

    // update match result with highlight
    public updateResult = (matches: Array<string>, testString: string): void => {
        let innerHTML: string = testString;
        let startPos: number = 0;
        let matchPos: number;
        const formatLength: number = 37;
        for (let i: number = 0; i < matches.length; ++i) {
            matchPos = innerHTML.indexOf(matches[i], startPos);
            startPos = matchPos + matches[i].length + formatLength;
            innerHTML = innerHTML.slice(0, matchPos) + '<span class="match-highlight">' + matches[i] + '</span>' + innerHTML.slice(matchPos + matches[i].length);
        }
        console.log(innerHTML);
        this.el.innerHTML = innerHTML;
    }

    private addStyle = (): void => {
        const sheet = document.createElement('style');
        sheet.innerHTML += '.match-highlight {background-color: yellow;}\n';
        document.body.appendChild(sheet); 
    }
}
interface IRegexInput {
	el: HTMLDivElement;
	getText(): string
}

interface ITestStringInput {
    el: HTMLDivElement;
}

interface IStatusOutput {
    el: HTMLTextAreaElement;
}

interface ITestButton {
    el: HTMLButtonElement;
}

interface ITestResult {
    el: HTMLDivElement;
}

interface IRegexOptions {
	el: HTMLDivElement;
	getFlags(): string?;
}

interface Pyodide {
	_module: PyodideModule

	/**
	 * The loaded Package Map
	 */
	loadedPackages: { [key: string]: string }

	loadPackage(
		packages: string | string[],
		callback?: MessageCallback,
	): Promise<void>
	runPython(script: string): void
	runPythonAsync(script: string, callback?: MessageCallback): Promise<any>
	version(): string
	globals: any
}

interface MatchGroup {
	group_id: number
	start: number
	end: number
	data: string
	name?: string
}

interface PatternGroup {
	start: number
	end: number
}

interface IParsonsInput {
	el: HTMLDivElement
}

// definition for randomcolor
declare module 'randomcolor';
declare module 'parchment';
interface IRegexInput {
    el: HTMLTextAreaElement;
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

// definition for randomcolor
declare module 'randomcolor';
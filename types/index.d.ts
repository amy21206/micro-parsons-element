interface IRegexInput {
    parentElement: RegexElement;
	el: HTMLDivElement;
	getText(): string;
	updateTestStatus(string): void;
	highlightError(number): void;
	removeFormat(): void;
}

interface IRegexStatusTag {
	el: HTMLSpanElement;
	updateStatus(string): void;
}

interface ITestStringInput {
	el: HTMLDivElement;
}

interface IStatusOutput {
	el: HTMLDivElement;
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

interface Skulpt {
	configure: any
	builtinFiles: any
	importMainWithBody: any
	importModule: any
	execLimit:number
	builtin: any
	ffi: any
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

type TestCase = {
	input: string;
	expect: Array<string>;
	notes?: string;
}

type UnitTestResult = {
	success: boolean;
	match: Array<string>?;
	errorMessage: string?;
}

interface IUnitTestTable {
	el: HTMLDivElement;
	flags: string;
	testCases: Array<TestCase>
	check(regex: string): void
}

// definition for randomcolor
declare module 'randomcolor';
declare module 'parchment';

// declare namespace RegexEvent {
//     type BasicEvent = {
//         studentId: string;
//         problemId: string;
//         clientTimestamp: string;
//     }

//     enum ParsonsInputAction {
//         ADD = "add",
//         MOVE = "move",
//         REMOVE = "remove"
//     }

//     type ParsonsInputEvent = {
//         eventType: 'parsons';
//         action: ParsonsInputAction;
//         position: [number, number];
//         answer: Array<string>;
//     }
// }

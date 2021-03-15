export namespace RegexEvent {
    export type BasicEvent = {
        studentId: string;
        problemId: string;
        clientTimestamp: string;
    }

    export enum ParsonsInputAction {
        ADD = "add",
        MOVE = "move",
        REMOVE = "remove"
    }

    export enum RegexCompilationStatus {
        ERROR = 'error',
        SUCCESS = 'success'
    }

    // not implemented 
    export type ParsonsInputEvent = {
        eventType: 'parsons';
        action: ParsonsInputAction;
        position: [number, number];
        answer: Array<string>;
        status: RegexCompilationStatus;
        errorMessage: string | null;
    }

    // not implemented 
    export type ParsonsTooltipEvent = {
        eventType: 'parsons-tooltip';
        block: string;
        tooltip: string;
    }

    // not implemented 
    export type FreeInputEvent = {
        eventType: 'free-input';
        dropped: boolean; 
        delta: any;
        answer: string;
        status: RegexCompilationStatus;
        errorMessage: string | null;
    }

    // not implemented 
    export type FreeKeyboardEvent = {
        eventType: 'free-input-keyboard';
        keys: Array<string>; 
    }

    // not implemented 
    export type TestStringInputEvent = {
        eventType: 'test-string-input';
        dropped: boolean;
        delta: any;
        testString: string;
    }

    // not implemented 
    export type TestStringResetEvent = {
        eventType: 'test-string-reset';
        delta: any;
        testString: string;
    }

    export enum MatchTriggerType {
        MANUAL = "manual",
        AUTO = "auto"
    }

    // not implemented 
    export type MatchTestStringEvent = {
        eventType: 'match';
        trigger: MatchTriggerType;
        regex: string;
        testString: string;
        flags: Array<string>;
        matchResult: Array<Array<MatchGroup>>;
    }

    // not implemented and not used in the current version
    export type SetRegexFlags = {}

    // not implemented and not used in the current version
    export type SetAlwaysCheckOnInput = {
    }

    export enum PageStatus {
        FOCUS = 'focus',
        VISIBILITY = 'visibility'
    }

    // not implemented 
    export type PageViewingStatus = {
        eventType: 'page-status';
        statusType: PageStatus;
        result: boolean;
    }
}

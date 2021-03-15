export namespace RegexEvent {
    export type BasicEvent = {
        'student-id': string;
        'problem-id': string;
        'client-timestamp': string;
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
        'event-type': 'parsons';
        action: ParsonsInputAction;
        position: [number, number];
        answer: Array<string>;
        status: RegexCompilationStatus;
        'error-message': string | null;
    }

    // not implemented 
    export type ParsonsTooltipEvent = {
        'event-type': 'parsons-tooltip';
        block: string;
        tooltip: string;
    }

    // not implemented 
    export type FreeInputEvent = {
        'event-type': 'free-input';
        dropped: boolean; 
        delta: any;
        answer: string;
        status: RegexCompilationStatus;
        'error-message': string | null;
    }

    // not implemented 
    export type FreeKeyboardEvent = {
        'event-type': 'free-input-keyboard';
        keys: Array<string>; 
    }

    // not implemented 
    export type TestStringInputEvent = {
        'event-type': 'test-string-input';
        dropped: boolean;
        delta: any;
        'test-string': string;
    }

    // not implemented 
    export type TestStringResetEvent = {
        'event-type': 'test-string-reset';
        delta: any;
        'test-string': string;
    }

    export enum MatchTriggerType {
        MANUAL = "manual",
        AUTO = "auto"
    }

    // not implemented 
    export type MatchTestStringEvent = {
        'event-type': 'match';
        trigger: MatchTriggerType;
        regex: string;
        'test-string': string;
        flags: Array<string>;
        'match-result': Array<Array<MatchGroup>>;
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
    export type PageStatusEvent = {
        'event-type': 'page-status';
        'status-type': PageStatus;
        result: boolean;
    }

    // not implemented 
    export type PageVisibilityCapturable = {
        'event-type': 'page-visibility-status';
        enabled: boolean;
    }
}

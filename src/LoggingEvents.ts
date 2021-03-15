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

    export type ParsonsInputEvent = {
        'event-type': 'parsons';
        action: ParsonsInputAction;
        position: [number, number];
        answer: Array<string>;
        valid: boolean;
        'error-message': string | null;
    }

    export type ParsonsTooltipEvent = {
        'event-type': 'parsons-tooltip';
        block: string;
        tooltip: string;
    }

    export type FreeInputEvent = {
        'event-type': 'free-input';
        dropped: boolean; 
        delta: any;
        answer: string;
        valid: boolean;
        'error-message': string | null;
    }

    export type FreeKeyboardEvent = {
        'event-type': 'free-input-keyboard';
        range: any;
        keys: Array<string>; 
    }

    export type TestStringInputEvent = {
        'event-type': 'test-string-input';
        dropped: boolean;
        delta: any;
        'test-string': string;
    }

    export type TestStringKeyboardEvent = {
        'event-type': 'test-string-keyboard';
        range: any;
        keys: Array<string>; 
    }

    export type TestStringResetEvent = {
        'event-type': 'test-string-reset';
        'test-string': string;
    }

    export enum MatchTriggerType {
        MANUAL = "manual",
        AUTO = "auto"
    }

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

    export type PageStatusEvent = {
        'event-type': 'page-status';
        'status-type': PageStatus;
        result: boolean;
    }

    export type PageVisibilityCapturable = {
        'event-type': 'page-visibility-status';
        enabled: boolean;
    }
}

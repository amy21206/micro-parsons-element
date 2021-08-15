export namespace RegexEvent {
    export type BasicEvent = {
        'student-id': string;
        'problem-id': string;
        'course-id': string;
        'input-type': string;
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
        // only exist for add events
        'add-by-click': boolean | null;
        // number of block added
        'add-block-cnt': number | null;
        // only exist for add events
        'is-expandable': boolean | null;
        'error-message': string | null;
    }

    export type ParsonsTooltipEvent = {
        'event-type': 'parsons-tooltip';
        block: string;
        tooltip: string;
        start: boolean; // true if start showing the tooltip, false if stop showing the tooltip.
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
        'slot': string | null; // positive or negative
        dropped: boolean;
        delta: any;
        'test-string': string;
    }

    export type TestStringKeyboardEvent = {
        'event-type': 'test-string-keyboard';
        'slot': string | null; // positive or negative
        range: any;
        keys: Array<string>; 
    }

    export type TestStringResetEvent = {
        'event-type': 'test-string-reset';
        'slot': string | null; // positive or negative
        'test-string': string;
    }

    export enum MatchTriggerType {
        MANUAL = "manual",
        AUTO = "auto"
    }

    export type MatchTestStringEvent = {
        'event-type': 'match';
        'slot': string | null; // positive or negative
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

    export type UnittestSet ={
        'event-type': 'unittest-set';
        'test-cases': any;
    }

    export type UnittestRun ={
        'event-type': 'unittest-run';
        // list of status for the unit tests
        'status': Array<string>;
    }

    export type CognitiveLoad = {
        'event-type': 'cognitive-load';
        'data': number;
    }

    export type ProblemFinished = {
        'event-type': 'problem-finished';
        // true if passed all test cases, false if time run out
        'completed': boolean;
    }

    export type PageConfig = {
        'event-type': 'page-config';
        'config': any;
    }

    export type TestAnswer = {
        'event-type': 'test-answer';
        'question-id': string;
        // pretest or posttest
        'context': string;
        'answer': any;
    }

    // Consent to share their answer with the rest of class
    // for SIADS 505, 21 fall
    export type ShareConsent = {
        'event-type': 'share-consent';
        'consent': 'Y-credit' | 'Y-anonymous' | 'N';
        'email': string;
    }
}

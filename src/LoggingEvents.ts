export namespace ParsonsEvent {
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

    export type ParsonsInputEvent = {
        'event-type': 'parsons-input';
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
}

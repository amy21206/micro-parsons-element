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

    export type ParsonsInputEvent = {
        eventType: 'parsons';
        action: ParsonsInputAction;
        position: [number, number];
        answer: Array<string>;
    }
}

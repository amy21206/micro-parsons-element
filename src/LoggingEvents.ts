export namespace MicroParsonsEvent {

    export enum InputAction {
        ADD = "add",
        MOVE = "move",
        REMOVE = "remove"
    }

    export type Input = {
        'type': 'input';
        action: InputAction;
        position: [number, number];
        answer: Array<string>;
    }

    export type Tooltip = {
        'type': 'tooltip';
        block: string;
        tooltip: string;
        show: boolean; // true if showing the tooltip, false if hiding
    }

    export type Reset = {
        'type': 'reset';
    }
}

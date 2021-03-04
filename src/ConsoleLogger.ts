import {ConsoleHandler, Logger, Level, JSONFormatter} from 'schema_logger';

const formatter = new JSONFormatter();

const consoleHandler = new ConsoleHandler({
    formatter: formatter,
    enforceSchemas: false,
    level: Level.DEBUG
});

export class ConsoleLogger extends Logger {
    constructor(handlers = [consoleHandler]) {
        super(handlers);
    }
}

// export const log = new DefaultLogger();

// let data: any = { foo: 1 };

// log.info(data);

// data = { foo: 'a' };

// log.info(data);
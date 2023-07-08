"use strict";
import stringifySafe from "json-stringify-safe";
import { serializeError } from "serialize-error";
import { v1 as uuidv1 } from "uuid";
;
export const LogLevels = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
};
export function isString(val) {
    return (typeof val === "string" || val instanceof String);
}
export function errorReplacer(key, value) {
    if (value instanceof Error) {
        return serializeError(value);
    }
    return value;
}
export function stringify(log, indent) {
    return stringifySafe(log, errorReplacer, indent);
}
;
/**
 * Boilerplate logger class. This will auto create the ID of Log if not provided.
 */
export class BaseLogger {
    level;
    constructor(level) {
        this.level = LogLevels[level];
    }
    debug(log) {
        if (isString(log)) {
            this.debug({
                message: log,
                type: "null",
            });
        }
        else {
            this.log("debug", log);
        }
    }
    info(log) {
        if (isString(log)) {
            this.info({
                message: log,
                type: "null",
            });
        }
        else {
            this.log("info", log);
        }
    }
    warn(log) {
        if (isString(log)) {
            this.warn({
                message: log,
                type: "null",
            });
        }
        else {
            this.log("warn", log);
        }
    }
    error(log) {
        if (isString(log)) {
            this.error({
                message: log,
                type: "null",
            });
        }
        else {
            this.log("error", log);
        }
    }
    log(level, log) {
        if (this.level >= LogLevels[level]) {
            const config = { level, ...log };
            config.id = config.id ?? uuidv1();
            this.write(config);
        }
    }
}
;
export class ConsoleLogger extends BaseLogger {
    #indent;
    constructor(level, indent) {
        super(level);
        this.#indent = indent;
    }
    write(log) {
        console[log.level](stringify(log, this.#indent));
    }
}
;

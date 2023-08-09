import stringifySafe from "json-stringify-safe";
import { serializeError } from "serialize-error";
import { v1 as uuidv1 } from "uuid";

export type LogLevel = "error" | "warn" | "info" | "debug";

export interface LogProps<T> {
  id?: string; // unique id
  reference_id?: string; // process id
  message?: string;
  type?: string | "null";
  meta?: T;
};

export type LogConfig<T> = LogProps<T> & { level: LogLevel } & { id: string };

export interface Logger {
  get level(): number;
  debug(message: string): void;
  debug<T>(content: LogProps<T>): void;
  info(message: string): void;
  info<T>(content: LogProps<T>): void;
  warn(message: string): void;
  warn<T>(content: LogProps<T>): void;
  error(message: string): void;
  error<T>(content: LogProps<T>): void;
  log<T>(level: LogLevel, content: LogProps<T>): void;
};

export const LogLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

export type JsonIndent = string | number | null | undefined;

export function isString(val: unknown): boolean {
  return (typeof val === "string" || val instanceof String);
}

export function errorReplacer(key: string, value: any): any {
  if (value instanceof Error) {
    return serializeError(value);
  }
  return value;
}

export function stringify(log: any, indent?: JsonIndent) {
  return stringifySafe(log, errorReplacer, indent);
};

/**
 * Boilerplate logger class. This will auto create the ID of Log if not provided.
 */
export abstract class BaseLogger implements Logger {
  level: number;

  constructor(level: LogLevel) {
    this.level = LogLevels[level];
  }

  debug<T>(log: string | LogProps<T>): void {
    if (isString(log)) {
      this.debug<null>({
        message: log as string,
      });
    }
    else {
      this.log("debug", log as LogProps<T>);
    }
  }

  info<T>(log: string | LogProps<T>): void {
    if (isString(log)) {
      this.info<null>({
        message: log as string,
      });
    }
    else {
      this.log("info", log as LogProps<T>);
    }
  }

  warn<T>(log: string | LogProps<T>): void {
    if (isString(log)) {
      this.warn<null>({
        message: log as string,
      });
    }
    else {
      this.log("warn", log as LogProps<T>);
    }
  }

  error<T>(log: string | LogProps<T>): void {
    if (isString(log)) {
      this.error<null>({
        message: log as string,
      });
    }
    else {
      this.log("error", log as LogProps<T>);
    }
  }

  log<T>(level: LogLevel, log: LogProps<T>) {
    if (this.level >= LogLevels[level]) {
      const base: LogConfig<T> = {
        level,
        id: log.id ?? uuidv1(),
      };
      const config = { ...log, ...base };
      this.write<T>(config);
    }
  }

  abstract write<T>(config: LogConfig<T>): void;
};

export class ConsoleLogger extends BaseLogger {
  #indent?: JsonIndent;

  constructor(level: LogLevel, indent?: JsonIndent) {
    super(level);
    this.#indent = indent;
  }

  write<T>(config: LogConfig<T>): void {
    console[config.level](stringify(config, this.#indent));
  }
};

"use strict";

import stringifySafe from "json-stringify-safe";
import { serializeError } from "serialize-error";
import { v1 as uuidv1 } from "uuid";

export type LogLevel = "error" | "warn" | "info" | "debug";

export type Log<T> = {
  id?: string;
  message: string;
  type: string | "null";
  meta?: T;
};

export type LogConfig<T> = Log<T> & { level: LogLevel };

export interface Logger {
  get level(): number;
  debug(message: string): void;
  debug<T>(content: Log<T>): void;
  info(message: string): void;
  info<T>(content: Log<T>): void;
  warn(message: string): void;
  warn<T>(content: Log<T>): void;
  error(message: string): void;
  error<T>(content: Log<T>): void;
  log<T>(level: LogLevel, content: Log<T>): void;
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

export abstract class BaseLogger implements Logger {
  level: number;

  constructor(level: LogLevel) {
    this.level = LogLevels[level];
  }

  debug<T>(log: string | Log<T>): void {
    if (isString(log)) {
      this.debug<null>({
        message: log as string,
        type: "null",
      });
    }
    else {
      this.log("debug", log as Log<T>);
    }
  }

  info<T>(log: string | Log<T>): void {
    if (isString(log)) {
      this.info<null>({
        message: log as string,
        type: "null",
      });
    }
    else {
      this.log("info", log as Log<T>);
    }
  }

  warn<T>(log: string | Log<T>): void {
    if (isString(log)) {
      this.warn<null>({
        message: log as string,
        type: "null",
      });
    }
    else {
      this.log("warn", log as Log<T>);
    }
  }

  error<T>(log: string | Log<T>): void {
    if (isString(log)) {
      this.error<null>({
        message: log as string,
        type: "null",
      });
    }
    else {
      this.log("error", log as Log<T>);
    }
  }

  log<T>(level: LogLevel, log: Log<T>) {
    if (this.level >= LogLevels[level]) {
      const config = { level, ...log };
      config.id = config.id ?? uuidv1();
      this.write<T>(config);
    }
  }

  abstract write<T>(log: LogConfig<T>): void;
};

export class ConsoleLogger extends BaseLogger {
  #indent?: JsonIndent;

  constructor(level: LogLevel, indent?: JsonIndent) {
    super(level);
    this.#indent = indent;
  }

  write<T>(log: LogConfig<T>): void {
    console[log.level](stringify(log, this.#indent));
  }
};

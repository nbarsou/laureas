// src/lib/logging/console.ts
import { Logger, LogLevel } from "./types";

const prefix = "[Laureas]"; // change to your project name

export const consoleLogger: Logger = {
  debug: (msg, meta) =>
    process.env.NODE_ENV === "development" &&
    console.debug(prefix, LogLevel.DEBUG, msg, meta ?? ""),
  info: (msg, meta) => console.info(prefix, LogLevel.INFO, msg, meta ?? ""),
  warn: (msg, meta) => console.warn(prefix, LogLevel.WARN, msg, meta ?? ""),
  error: (msg, meta) => console.error(prefix, LogLevel.ERROR, msg, meta ?? ""),
};

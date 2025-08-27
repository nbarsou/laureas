// src/lib/logging/winston.ts
import { createLogger, transports, format } from "winston";
import { Logger } from "./types";

const dev = process.env.NODE_ENV !== "production";

const base = createLogger({
  level: process.env.LOG_LEVEL ?? (dev ? "debug" : "info"),
  format: dev
    ? format.combine(
        format.colorize({ all: true }),
        format.timestamp(),
        format.printf(
          ({ level, message, timestamp, ...rest }) =>
            `${timestamp} ${level} ${message} ${
              Object.keys(rest).length ? JSON.stringify(rest) : ""
            }`
        )
      )
    : format.combine(format.timestamp(), format.json()),
  transports: [new transports.Console()],
});

export const winstonLogger: Logger = {
  debug: (msg, meta) => base.debug(msg, meta),
  info: (msg, meta) => base.info(msg, meta),
  warn: (msg, meta) => base.warn(msg, meta),
  error: (msg, meta) => base.error(msg, meta),
};

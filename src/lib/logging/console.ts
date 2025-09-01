// src/lib/logging/console.ts
import { Logger, LogLevel } from "./types";

const prefix = "[Laureas]";
const TS = () => new Date().toISOString();

// simple color helpers (white text on colored background)
const B = (s: string) => `\x1b[1m${s}\x1b[0m`;
const BG = {
  debug: (s: string) => `\x1b[47m\x1b[30m Debug \x1b[0m: ${s}`, // white bg, black text
  info: (s: string) => `\x1b[44m\x1b[37m Info \x1b[0m: ${s}`, // blue bg, white text
  warn: (s: string) => `\x1b[43m\x1b[30m Warn \x1b[0m: ${s}`, // yellow bg, black text
  error: (s: string) => `\x1b[41m\x1b[37m Error \x1b[0m: ${s}`, // red bg, white text
};

function toPlainMeta(meta?: unknown) {
  if (!meta) return undefined;
  // Serialize Errors nicely and avoid circular refs
  if (meta instanceof Error) {
    const { name, message, stack } = meta;
    const code = (meta as any).code ?? (meta as any).status;
    return { err: { name, message, code, stack } };
  }
  try {
    return JSON.parse(JSON.stringify(meta));
  } catch {
    return { meta: String(meta) };
  }
}

function log(level: LogLevel, msg: string, meta?: unknown) {
  const m = toPlainMeta(meta);
  const line =
    `${prefix} ${BG[level](B(` ${level.toUpperCase()} `))} ${TS()} ${msg}` +
    (m ? ` ${JSON.stringify(m)}` : "");
  // map to console method
  (
    ({
      debug: console.debug,
      info: console.info,
      warn: console.warn,
      error: console.error,
    }) as const
  )[level](line);
}

export const consoleLogger: Logger = {
  debug: (msg, meta) => {
    if (process.env.NODE_ENV !== "production") log(LogLevel.DEBUG, msg, meta);
  },
  info: (msg, meta) => log(LogLevel.INFO, msg, meta),
  warn: (msg, meta) => log(LogLevel.WARN, msg, meta),
  error: (msg, meta) => log(LogLevel.ERROR, msg, meta),
};

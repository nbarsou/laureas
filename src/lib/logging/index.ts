// src/lib/logging/index.ts
import { consoleLogger } from "./console";
import type { Logger } from "./types";

let logger: Logger = consoleLogger;

// Server-side + WINSTON=true → swap providers
if (typeof window === "undefined" && process.env.WINSTON === "true") {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { winstonLogger } = require("./winston");
  logger = winstonLogger;
}

export { logger };
export * from "./types";

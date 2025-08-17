// // src/lib/logging/index.ts
import { consoleLogger } from "./console";
import { Logger } from "./types";

let logger: Logger = consoleLogger; // default

// // Server-side? swap automatically if WINSTON=true
// if (typeof window === "undefined" && process.env.WINSTON === "true") {
//   // eslint-disable-next-line global-require
//   const { winstonLogger } = require("./winston");
//   logger = winstonLogger;
// }

// Re-export the concrete logger + helpers if needed
export { logger };
export * from "./types";

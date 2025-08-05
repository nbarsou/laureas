// src/lib/logging/winston.ts

/**
 * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ Logging: Winston Provider ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
 * | PURPOSE                                                                                 |
 * | --------------------------------------------------------------------------------------- |
 * | This module provides a Winston-backed implementation of our shared `Logger` interface.  |
 * | It’s **server-only** and **lazy-loaded** by `src/lib/logging/index.ts` whenever:        |
 * |     1. Code is running on the server (Node, not the browser/Edge runtime); and          |
 * |     2. The env-var `WINSTON=true` is set (e.g. in production or staging).               |
 * |                                                                                         |
 * | WHY THIS SEPARATE FILE?                                                                 |
 * | — Keeps all Node-specific code out of client bundles and Edge Functions.                |
 * | — Lets the rest of the app keep importing `logger.*()` without caring which provider    |
 * |   is active. Flip an env variable, deploy, done.                                        |
 * |                                                                                         |
 * | RUNTIME SWITCH                                                                          |
 * | *   In `src/lib/logging/index.ts` we default to the ultra-light console provider.       |
 * | *   If we’re on the server **and** `process.env.WINSTON === 'true'`, we `require()`     |
 * |     this file, replacing the provider with Winston.                                     |
 * |                                                                                         |
 * | EXTENDING / REPLACING TRANSPORTS                                                        |
 * | *   Add or swap Winston transports in the array below—e.g. `new transports.Http({...})` |
 * |     for Datadog, `new LokiTransport({...})`, etc.                                       |
 * | *   Adjust `format.combine(...)` as needed (e.g. add `format.colorize()` for dev).      |
 * | *   Control log level at runtime via `LOG_LEVEL` env var (`error`, `warn`, `info`,      |
 * |     `debug`).                                                                           |
 * |                                                                                         |
 * | EDGE + CLIENT NOTES                                                                     |
 * | * Never import this file directly in Edge Functions or React Client Components;         |
 * |   Winston depends on Node APIs (fs, stream).                                            |
 * | * Those environments will automatically keep using the tiny `consoleLogger`.            |
 * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
 */

// import { createLogger, transports, format } from 'winston';
// import { Logger, LogLevel } from './types';

// const base = createLogger({
//   level : process.env.LOG_LEVEL ?? LogLevel.INFO,
//   format: format.combine(
//     format.timestamp(),
//     format.json()
//   ),
//   transports: [
//     new transports.Console(),
//     // add CloudWatch, Loki, etc. here
//   ],
// });

// export const winstonLogger: Logger = {
//   debug: (msg, meta) => base.debug(msg, meta),
//   info : (msg, meta) => base.info (msg, meta),
//   warn : (msg, meta) => base.warn (msg, meta),
//   error: (msg, meta) => base.error(msg, meta),
// };

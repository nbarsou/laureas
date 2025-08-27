// src/lib/logging/timing.ts
import { logger } from "./index";

export async function time<T>(label: string, fn: () => Promise<T> | T): Promise<T> {
  const t0 = Date.now();
  try {
    const out = await fn();
    logger.debug(`${label}:done`, { duration_ms: Date.now() - t0 });
    return out;
  } catch (error) {
    logger.error(`${label}:fail`, { duration_ms: Date.now() - t0, error });
    throw error;
  }
}

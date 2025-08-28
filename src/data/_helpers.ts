// src/data/_helpers.ts
import { z } from "zod";
import { Types } from "mongoose";

/** Zod bits you’ll reuse */
export const zObjectId = z
  .string()
  .refine(Types.ObjectId.isValid, "Invalid id");
export const zDate = z.coerce.date("Must be a date");

/** Normalize _id to string for lean() results */
export const strId = <T extends { _id: unknown }>(d: T) =>
  ({ ...d, _id: String((d as any)._id) } as Omit<T, "_id"> & { _id: string });

export const strIds = <T extends { _id: unknown }>(ds: T[]) => ds.map(strId);

/** (Optional) tiny action result type to keep forms simple */
export type ActionResult = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string[] | undefined>;
  /** sticky values to re-fill the form after a failed submit */
  values?: Record<string, any>;
};

/** Generic FormData → plain object (handles repeated keys → arrays) */
export function formDataToObject(fd: FormData): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [k, v] of fd.entries()) {
    if (k in out) {
      const cur = out[k];
      out[k] = Array.isArray(cur) ? [...cur, v] : [cur, v];
    } else {
      out[k] = v;
    }
  }
  return out;
}

/** One-liner: parse any FormData with a Zod schema (no manual field picking) */
export function safeParseForm<T>(fd: FormData, schema: z.ZodSchema<T>) {
  const raw = formDataToObject(fd);
  return schema.safeParse(raw);
}

// data/_helpers.ts
import { Types } from "mongoose";
import { z } from "zod";

export const zObjectId = z
  .string()
  .refine(Types.ObjectId.isValid, { message: "Invalid ObjectId" })
  .transform((v) => new Types.ObjectId(v));

export type FieldErrors = Record<string, string[]>;

export type ActionResult<E = FieldErrors> = {
  ok: boolean;
  message?: string;
  errors?: E;
};

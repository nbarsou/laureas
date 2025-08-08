// data/_helpers.ts
import { Types } from "mongoose";
import { z } from "zod";

export const zObjectId = z
  .string()
  .refine(Types.ObjectId.isValid, { message: "Invalid ObjectId" })
  .transform((v) => new Types.ObjectId(v));

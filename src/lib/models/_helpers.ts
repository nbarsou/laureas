// lib/models/_helpers.ts
import { Schema, Types } from "mongoose";

/** Mongoose ObjectId shortcut */
export const ObjectId = Schema.Types.ObjectId;

/** Handy TS alias if you ever need it in controllers */
export type Id = Types.ObjectId;

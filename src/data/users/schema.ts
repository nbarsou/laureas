import { model, models, Schema } from "mongoose";
import { softDeletePlugin } from "@/data/_plugins/softDelete";
import { versionSemverPlugin } from "../_plugins/version";
import { VERSIONS } from "../version";

const mongooseSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    name: { type: String, trim: true, maxlength: 120 },
    image: { type: String },
    // auth options
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String }, // encrypted at rest if possible
    // global power user:
    isRoot: { type: Boolean, default: false, index: true }, // “root” role
  },
  { timestamps: true }
);

mongooseSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);
mongooseSchema.plugin(softDeletePlugin);
mongooseSchema.plugin(versionSemverPlugin, { defaultVersion: VERSIONS.user });

export const UserModel = models.User || model("User", mongooseSchema);

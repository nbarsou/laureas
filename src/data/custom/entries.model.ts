// src/data/custom/entries.model.ts
import { Schema, model, models } from "mongoose";
import { softDeletePlugin } from "../_plugins/softDelete";
import { versionSemverPlugin } from "../_plugins/version";
import { ENTRY_VERSION } from "./version";

const EntrySchema = new Schema(
  {
    entityType: {
      type: String,
      enum: ["team", "player", "tournament"],
      required: true,
    },
    entityId: { type: Schema.Types.ObjectId, required: true, index: true },
    key: { type: String, required: true },

    value: { type: Schema.Types.Mixed },

    isLocalDef: { type: Boolean, default: false },
    label: { type: String }, // present only when isLocalDef=true
    type: { type: String, enum: ["text", "number", "boolean"] },
    required: { type: Boolean },
    defaultValue: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

EntrySchema.index({ entityType: 1, entityId: 1, key: 1 }, { unique: true });
EntrySchema.plugin(versionSemverPlugin, { defaultVersion: ENTRY_VERSION });
EntrySchema.plugin(softDeletePlugin);

export const CustomFieldEntryModel =
  models.CustomFieldEntry || model("CustomFieldEntry", EntrySchema);

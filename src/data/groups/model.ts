import { model, models, Schema } from "mongoose";
import { softDeletePlugin } from "../_plugins/softDelete";
import { versionSemverPlugin } from "../_plugins/version";
import { GROUP_VERSION } from "./version";

const GroupSchema = new Schema(
  {
    tournamentId: {
      type: Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    // If your softDeletePlugin adds isDeleted, leave it implicit
  },
  { timestamps: true }
);

// Unique name per tournament; keep compatible with soft delete (if your plugin adds isDeleted)
GroupSchema.index(
  { tournamentId: 1, name: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

GroupSchema.plugin(softDeletePlugin);
GroupSchema.plugin(versionSemverPlugin, { defaultVersion: GROUP_VERSION });

export const GroupModel = models.Group || model("Group", GroupSchema);
export { GroupSchema };

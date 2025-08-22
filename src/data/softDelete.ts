// /data/softDelete.ts
import { Schema } from "mongoose";

export function softDeletePlugin(schema: Schema) {
  schema.add({
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, index: true },
    deletedBy: { type: String },
    deleteReason: { type: String },
  });

  const notDeletedFilter = { isDeleted: { $ne: true } };

  function applyNotDeleted(this: any) {
    if (!this.getFilter()?.withDeleted) {
      this.where(notDeletedFilter);
    } else {
      // strip marker
      const f = this.getFilter();
      delete f.withDeleted;
    }
  }

  schema.pre("find", applyNotDeleted);
  schema.pre("findOne", applyNotDeleted);
  // schema.pre("count", applyNotDeleted);
  schema.pre("countDocuments", applyNotDeleted);
  schema.pre("findOneAndUpdate", function () {
    applyNotDeleted.call(this);
  });

  schema.methods.softDelete = function (by?: string, reason?: string) {
    this.isDeleted = true;
    this.deletedAt = new Date();
    if (by) this.deletedBy = by;
    if (reason) this.deleteReason = reason;
    return this.save();
  };

  schema.methods.restore = function () {
    this.isDeleted = false;
    this.deletedAt = undefined;
    this.deletedBy = undefined;
    this.deleteReason = undefined;
    return this.save();
  };
}

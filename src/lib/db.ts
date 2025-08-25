// lib/db.ts
import mongoose from "mongoose";
import { logger } from "@/lib/logging";

const uri = process.env.MONGODB_URI!;
const dbName = process.env.MONGODB_DB!;

let conn: Promise<typeof mongoose> | null = null;

// Global JSON transforms for NON-lean docs
(function applyGlobalToJSONTransform() {
  const t = (_doc: any, ret: any) => {
    if (ret._id) ret._id = String(ret._id);
    if (ret.id === undefined && ret._id) ret.id = ret._id;
    delete ret.__v;
    return ret;
  };
  mongoose.set("toJSON", { virtuals: true, transform: t });
  mongoose.set("toObject", { virtuals: true, transform: t });

  mongoose.connection.on("disconnected", () =>
    logger.warn("MongoDB disconnected")
  );
  mongoose.connection.on("error", (err) =>
    logger.error("MongoDB error", { err })
  );
})();

export function getConn() {
  return (conn ??= mongoose
    .connect(uri, { dbName, bufferCommands: false })
    .then((m) => {
      logger.info("✅ MongoDB connected", { db: m.connection.name });
      return m;
    }));
}

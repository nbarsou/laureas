// lib/db.ts
import mongoose from "mongoose";
import { logger } from "@/lib/logging/index"; // your minimal logger

const uri = process.env.MONGODB_URI!;
const dbName = process.env.MONGODB_DB!;

let conn: Promise<typeof mongoose> | null = null;

export function getConn() {
  return (conn ??= mongoose
    .connect(uri, { dbName, bufferCommands: false })
    .then((m) => {
      logger.info("✅ MongoDB connected");
      return m;
    }));
}

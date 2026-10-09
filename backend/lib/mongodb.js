import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

// In dev, Next.js hot-reloads modules on every change. Caching the connection
// on globalThis stops each reload from opening a new connection pool.
let cached = globalThis.mongoose;
if (!cached) {
  cached = globalThis.mongoose = { conn: null, promise: null };
}

export default async function dbConnect() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not set. Add it to .env.local");
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    // Let the next request retry instead of reusing a failed promise.
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}

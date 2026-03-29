import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/db/schema";

type Db = ReturnType<typeof drizzle<typeof schema>>;

const globalForDb = globalThis as typeof globalThis & { db?: Db };

export function getDb(): Db {
  if (globalForDb.db) {
    return globalForDb.db;
  }
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add it to .env.local (see .env.example).",
    );
  }
  const sql = neon(url);
  const instance = drizzle(sql, { schema });
  globalForDb.db = instance;
  return instance;
}

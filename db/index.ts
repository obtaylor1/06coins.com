import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../shared/schema.js";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,
  connectionLimit: Number.parseInt(process.env.DATABASE_POOL_SIZE || "10", 10),
  idleTimeout: 30_000,
  connectTimeout: 10_000,
});

export const db = drizzle(pool, { schema, mode: "default" });

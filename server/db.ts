import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

// Remove channel_binding param — not supported by node-postgres
const dbUrl = new URL(process.env.DATABASE_URL);
dbUrl.searchParams.delete("channel_binding");
const connectionString = dbUrl.toString();

export const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

export const db = drizzle({ client: pool, schema });

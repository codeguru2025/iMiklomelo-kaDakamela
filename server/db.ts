import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Fix for DigitalOcean managed databases with self-signed certificates
// Replace sslmode=require with sslmode=no-verify to bypass certificate validation
let databaseUrl = process.env.DATABASE_URL;
if (databaseUrl.includes('sslmode=require')) {
  databaseUrl = databaseUrl.replace('sslmode=require', 'sslmode=no-verify');
  console.log(`[Database] Modified SSL mode from 'require' to 'no-verify' for DO managed database`);
}

console.log(`[Database] Environment: ${process.env.NODE_ENV}`);
console.log(`[Database] Connection string contains sslmode:`, databaseUrl.includes('sslmode'));

const pool = new Pool({
  connectionString: databaseUrl,
});

export const db = drizzle(pool, { schema });

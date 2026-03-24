import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Determine SSL configuration
// DigitalOcean managed databases use self-signed certificates
const shouldUseSSL = process.env.DATABASE_URL?.includes('sslmode=require') || 
                     process.env.DATABASE_URL?.includes('digitalocean') ||
                     process.env.DATABASE_URL?.includes('doadmin') ||
                     process.env.NODE_ENV === "production";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: shouldUseSSL ? { rejectUnauthorized: false } : undefined,
});

export const db = drizzle(pool, { schema });

import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Determine SSL configuration
// DigitalOcean managed databases use self-signed certificates
const isProduction = process.env.NODE_ENV === "production";
const isDODatabase = process.env.DATABASE_URL?.includes('sslmode=require') || 
                     process.env.DATABASE_URL?.includes('digitalocean') ||
                     process.env.DATABASE_URL?.includes('doadmin');

console.log(`[Database] Environment: ${process.env.NODE_ENV}`);
console.log(`[Database] Using SSL: ${isProduction || isDODatabase}`);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Always use SSL with rejectUnauthorized: false in production or for DO databases
  ssl: (isProduction || isDODatabase) ? { rejectUnauthorized: false } : false,
});

export const db = drizzle(pool, { schema });

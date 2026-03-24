import { defineConfig } from "drizzle-kit";

// Migrations must use the DIRECT connection (not the pooler)
const migrationUrl = process.env.DATABASE_DIRECT_URL || process.env.DATABASE_URL;

if (!migrationUrl) {
  throw new Error("DATABASE_DIRECT_URL or DATABASE_URL must be set for migrations");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: migrationUrl,
  },
});

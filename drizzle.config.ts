import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Direct URL for migrations (not the pooler)
    url: process.env.DIRECT_URL!,
  },
});

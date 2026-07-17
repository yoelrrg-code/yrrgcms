import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Use the pooler URL at runtime (Vercel serverless / edge functions)
// The direct URL is reserved for drizzle-kit migrations only
const connectionString = process.env.DATABASE_URL!;

// Disable prefetch as it's not supported for "transaction" pool mode
const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });

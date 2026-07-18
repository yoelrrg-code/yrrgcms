/**
 * Seed script — creates the first admin user.
 * Run once after pushing the schema:
 *   npx tsx scripts/seed-admin.ts
 *
 * Requires DIRECT_URL env var (or DATABASE_URL pointing to Supabase).
 */

import "dotenv/config";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { users } from "../lib/db/schema";
import bcrypt from "bcryptjs";

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@example.com";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "changeme123";
const ADMIN_NAME = process.env.SEED_ADMIN_NAME || "Admin";

async function main() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DIRECT_URL or DATABASE_URL environment variable is required");
  }

  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client);

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  try {
    const [user] = await db
      .insert(users)
      .values({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        passwordHash,
        role: "admin",
      })
      .onConflictDoNothing()
      .returning({ id: users.id, email: users.email });

    if (user) {
      console.log(`✅ Admin user created: ${user.email} (id: ${user.id})`);
    } else {
      console.log(`ℹ️  User ${ADMIN_EMAIL} already exists — skipped.`);
    }

    // Seed default globals (header and footer)
    const { globals } = await import("../lib/db/schema");
    await db
      .insert(globals)
      .values([
        {
          key: "header",
          value: {
            siteName: "YRRG CMS",
            logoUrl: "",
            ctaText: "Contact Us",
            ctaUrl: "/contact",
          },
        },
        {
          key: "footer",
          value: {
            copyright: `© ${new Date().getFullYear()} YRRG CMS. All rights reserved.`,
            socialLinks: [],
            columns: [],
          },
        },
        {
          key: "seo_defaults",
          value: {
            siteTitle: "YRRG CMS",
            description: "A powerful CMS built with Next.js",
            ogImage: "",
            favicon: "",
          },
        },
      ])
      .onConflictDoNothing();

    console.log("✅ Default globals seeded.");
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

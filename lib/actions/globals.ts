"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { globals } from "@/lib/db/schema";
import { requireCan } from "@/lib/permissions";
import { eq } from "drizzle-orm";

type GlobalKey = "header" | "footer" | "seo_defaults" | "payment_methods";

// Returns the value jsonb for a given global key
export async function getGlobal(key: GlobalKey) {
  const [row] = await db
    .select()
    .from(globals)
    .where(eq(globals.key, key))
    .limit(1);

  return row?.value ?? null;
}

// Upserts the value for a given global key (admin-only write)
export async function saveGlobal(key: GlobalKey, value: Record<string, unknown>) {
  const session = await auth();
  requireCan(session, "manage", "globals");

  await db
    .insert(globals)
    .values({ key, value, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: globals.key,
      set: { value, updatedAt: new Date() },
    });

  return { key, value };
}

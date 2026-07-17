"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { tags } from "@/lib/db/schema";
import { requireCan } from "@/lib/permissions";
import { eq, desc } from "drizzle-orm";

// Returns all tags
export async function getTags() {
  const session = await auth();
  requireCan(session, "read", "tags");

  return db.select().from(tags).orderBy(desc(tags.createdAt));
}

// Returns a single tag by id
export async function getTagById(id: string) {
  const session = await auth();
  requireCan(session, "read", "tags");

  const [tag] = await db
    .select()
    .from(tags)
    .where(eq(tags.id, id))
    .limit(1);

  return tag ?? null;
}

// Creates a new tag; authors and admins can create tags
export async function createTag(data: { name: string; slug: string }) {
  const session = await auth();
  requireCan(session, "create", "tags");

  const [newTag] = await db
    .insert(tags)
    .values({
      name: data.name,
      slug: data.slug,
    })
    .returning();

  return newTag;
}

// Updates a tag; admin only
export async function updateTag(id: string, data: { name?: string; slug?: string }) {
  const session = await auth();
  // "manage" maps to admin-only in the permissions matrix for tags (authors can only create/read)
  requireCan(session, "manage", "tags");

  const [updated] = await db
    .update(tags)
    .set(data)
    .where(eq(tags.id, id))
    .returning();

  return updated;
}

// Deletes a tag; admin only
export async function deleteTag(id: string) {
  const session = await auth();
  requireCan(session, "delete", "tags");

  await db.delete(tags).where(eq(tags.id, id));
}

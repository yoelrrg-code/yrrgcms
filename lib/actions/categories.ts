"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { categories, postCategories } from "@/lib/db/schema";
import { requireCan } from "@/lib/permissions";
import { eq, desc } from "drizzle-orm";

// Returns all categories with parent name
export async function getCategories() {
  const session = await auth();
  requireCan(session, "read", "categories");

  // Self-join to get parent name
  const parent = db.$with("parent").as(
    db.select({ id: categories.id, name: categories.name }).from(categories)
  );

  const rows = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
      parentId: categories.parentId,
      createdAt: categories.createdAt,
      updatedAt: categories.updatedAt,
    })
    .from(categories)
    .orderBy(desc(categories.createdAt));

  // Resolve parent names in JS to avoid CTE complexity with Drizzle self-join
  const categoryMap = new Map(rows.map((c) => [c.id, c.name]));

  return rows.map((c) => ({
    ...c,
    parentName: c.parentId ? (categoryMap.get(c.parentId) ?? null) : null,
  }));
}

// Returns a single category by id
export async function getCategoryById(id: string) {
  const session = await auth();
  requireCan(session, "read", "categories");

  const [category] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id))
    .limit(1);

  return category ?? null;
}

// Creates a new category
export async function createCategory(data: {
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
}) {
  const session = await auth();
  requireCan(session, "manage", "categories");

  const [newCategory] = await db
    .insert(categories)
    .values({
      name: data.name,
      slug: data.slug,
      description: data.description,
      parentId: data.parentId,
    })
    .returning();

  return newCategory;
}

// Updates a category
export async function updateCategory(
  id: string,
  data: {
    name?: string;
    slug?: string;
    description?: string;
    parentId?: string | null;
  }
) {
  const session = await auth();
  requireCan(session, "manage", "categories");

  const [updated] = await db
    .update(categories)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(categories.id, id))
    .returning();

  return updated;
}

// Deletes a category; checks no posts still reference it
export async function deleteCategory(id: string) {
  const session = await auth();
  requireCan(session, "manage", "categories");

  const usages = await db
    .select({ postId: postCategories.postId })
    .from(postCategories)
    .where(eq(postCategories.categoryId, id))
    .limit(1);

  if (usages.length > 0) {
    throw new Error(
      "Cannot delete category: it is still assigned to one or more posts."
    );
  }

  await db.delete(categories).where(eq(categories.id, id));
}

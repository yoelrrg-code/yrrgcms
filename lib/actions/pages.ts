"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { pages, users } from "@/lib/db/schema";
import { requireCan } from "@/lib/permissions";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Returns all pages ordered by updatedAt desc with author name
export async function getPages() {
  const session = await auth();
  requireCan(session, "read", "pages");

  const rows = await db
    .select({
      id: pages.id,
      title: pages.title,
      slug: pages.slug,
      status: pages.status,
      template: pages.template,
      revalidate: pages.revalidate,
      authorId: pages.authorId,
      authorName: users.name,
      createdAt: pages.createdAt,
      updatedAt: pages.updatedAt,
      publishedAt: pages.publishedAt,
    })
    .from(pages)
    .leftJoin(users, eq(pages.authorId, users.id))
    .orderBy(desc(pages.updatedAt));

  return rows;
}

// For the public frontend — fetches a page by slug
export async function getPageBySlug(slug: string) {
  const [page] = await db
    .select()
    .from(pages)
    .where(eq(pages.slug, slug))
    .limit(1);

  return page ?? null;
}

// For the admin editor — fetches a page by id with full data
export async function getPageById(id: string) {
  const session = await auth();
  requireCan(session, "read", "pages");

  const [page] = await db
    .select()
    .from(pages)
    .where(eq(pages.id, id))
    .limit(1);

  return page ?? null;
}

// Creates a new page
export async function createPage(data: {
  title: string;
  slug: string;
  status?: "draft" | "published";
  template?: string;
  blocks?: unknown;
  seo?: unknown;
  revalidate?: number;
}) {
  const session = await auth();
  requireCan(session, "create", "pages");

  const [newPage] = await db
    .insert(pages)
    .values({
      title: data.title,
      slug: data.slug,
      status: data.status ?? "draft",
      template: data.template ?? "default",
      blocks: data.blocks ?? [],
      seo: data.seo ?? {},
      revalidate: data.revalidate ?? 60,
      authorId: session!.user!.id,
    })
    .returning();

  return newPage;
}

// Updates a page
export async function updatePage(
  id: string,
  data: {
    title?: string;
    slug?: string;
    status?: "draft" | "published";
    template?: string;
    blocks?: unknown;
    seo?: unknown;
    revalidate?: number;
  }
) {
  const session = await auth();
  requireCan(session, "edit", "pages");

  const [updated] = await db
    .update(pages)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(pages.id, id))
    .returning();

  return updated;
}

// Deletes a page
export async function deletePage(id: string) {
  const session = await auth();
  requireCan(session, "delete", "pages");

  await db.delete(pages).where(eq(pages.id, id));
  revalidatePath("/admin/pages");
}

// Publishes a page (sets status=published, publishedAt=now)
export async function publishPage(id: string) {
  const session = await auth();
  requireCan(session, "publish", "pages");

  const [updated] = await db
    .update(pages)
    .set({
      status: "published",
      publishedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(pages.id, id))
    .returning();

  revalidatePath("/admin/pages");
  return updated;
}

// Unpublishes a page (sets status=draft, publishedAt=null)
export async function unpublishPage(id: string) {
  const session = await auth();
  requireCan(session, "publish", "pages");

  const [updated] = await db
    .update(pages)
    .set({
      status: "draft",
      publishedAt: null,
      updatedAt: new Date(),
    })
    .where(eq(pages.id, id))
    .returning();

  revalidatePath("/admin/pages");
  return updated;
}

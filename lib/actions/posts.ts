"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { posts, users } from "@/lib/db/schema";
import { requireCan } from "@/lib/permissions";
import { eq, desc } from "drizzle-orm";

// Returns all posts (optionally filtered by authorId). Authors see only their own posts.
export async function getPosts(options?: { authorId?: string }) {
  const session = await auth();
  requireCan(session, "read", "posts");

  const role = (session?.user as { role?: string })?.role;
  const userId = session?.user?.id;

  // Authors can only list their own posts
  const effectiveAuthorId =
    role === "author" ? userId : options?.authorId;

  const query = db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      status: posts.status,
      excerpt: posts.excerpt,
      featuredImageUrl: posts.featuredImageUrl,
      authorId: posts.authorId,
      authorName: users.name,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      publishedAt: posts.publishedAt,
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .orderBy(desc(posts.updatedAt));

  if (effectiveAuthorId) {
    return query.where(eq(posts.authorId, effectiveAuthorId));
  }

  return query;
}

// For the public frontend — fetches a post by slug
export async function getPostBySlug(slug: string) {
  const [post] = await db
    .select()
    .from(posts)
    .where(eq(posts.slug, slug))
    .limit(1);

  return post ?? null;
}

// For the admin editor — fetches a post by id with full data
export async function getPostById(id: string) {
  const session = await auth();
  requireCan(session, "read", "posts");

  const [post] = await db
    .select()
    .from(posts)
    .where(eq(posts.id, id))
    .limit(1);

  return post ?? null;
}

// Creates a new post; sets authorId to the current user
export async function createPost(data: {
  title: string;
  slug: string;
  content?: unknown;
  excerpt?: string;
  featuredImageUrl?: string;
  status?: "draft" | "published";
  seo?: unknown;
}) {
  const session = await auth();
  requireCan(session, "create", "posts");

  const [newPost] = await db
    .insert(posts)
    .values({
      title: data.title,
      slug: data.slug,
      content: data.content ?? {},
      excerpt: data.excerpt,
      featuredImageUrl: data.featuredImageUrl,
      status: data.status ?? "draft",
      seo: data.seo ?? {},
      authorId: session!.user!.id,
    })
    .returning();

  return newPost;
}

// Updates a post; checks ownership permission
export async function updatePost(
  id: string,
  data: {
    title?: string;
    slug?: string;
    content?: unknown;
    excerpt?: string;
    featuredImageUrl?: string;
    status?: "draft" | "published";
    seo?: unknown;
  }
) {
  const session = await auth();

  // Fetch the post first so we can check ownership for authors
  const [existing] = await db
    .select()
    .from(posts)
    .where(eq(posts.id, id))
    .limit(1);

  if (!existing) throw new Error("Post not found.");

  requireCan(session, "edit", "posts", { authorId: existing.authorId });

  const [updated] = await db
    .update(posts)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(posts.id, id))
    .returning();

  return updated;
}

// Deletes a post; checks ownership permission
export async function deletePost(id: string) {
  const session = await auth();

  const [existing] = await db
    .select()
    .from(posts)
    .where(eq(posts.id, id))
    .limit(1);

  if (!existing) throw new Error("Post not found.");

  requireCan(session, "delete", "posts", { authorId: existing.authorId });

  await db.delete(posts).where(eq(posts.id, id));
}

// Publishes a post; checks ownership
export async function publishPost(id: string) {
  const session = await auth();

  const [existing] = await db
    .select()
    .from(posts)
    .where(eq(posts.id, id))
    .limit(1);

  if (!existing) throw new Error("Post not found.");

  requireCan(session, "publish", "posts", { authorId: existing.authorId });

  const [updated] = await db
    .update(posts)
    .set({
      status: "published",
      publishedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(posts.id, id))
    .returning();

  return updated;
}

// Unpublishes a post; checks ownership
export async function unpublishPost(id: string) {
  const session = await auth();

  const [existing] = await db
    .select()
    .from(posts)
    .where(eq(posts.id, id))
    .limit(1);

  if (!existing) throw new Error("Post not found.");

  requireCan(session, "publish", "posts", { authorId: existing.authorId });

  const [updated] = await db
    .update(posts)
    .set({
      status: "draft",
      publishedAt: null,
      updatedAt: new Date(),
    })
    .where(eq(posts.id, id))
    .returning();

  return updated;
}

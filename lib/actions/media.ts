"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { media } from "@/lib/db/schema";
import { requireCan } from "@/lib/permissions";
import { eq, desc } from "drizzle-orm";
import { del } from "@vercel/blob";

const DEFAULT_PAGE_SIZE = 24;

// Returns paginated media, newest first
export async function getMedia(options?: { page?: number; limit?: number }) {
  const session = await auth();
  requireCan(session, "read", "media");

  const page = Math.max(1, options?.page ?? 1);
  const limit = Math.min(100, options?.limit ?? DEFAULT_PAGE_SIZE);
  const offset = (page - 1) * limit;

  const rows = await db
    .select()
    .from(media)
    .orderBy(desc(media.createdAt))
    .limit(limit)
    .offset(offset);

  return { items: rows, page, limit };
}

// Deletes a media record and removes the file from Vercel Blob
export async function deleteMedia(id: string) {
  const session = await auth();
  requireCan(session, "delete", "media");

  const [record] = await db
    .select()
    .from(media)
    .where(eq(media.id, id))
    .limit(1);

  if (!record) throw new Error("Media record not found.");

  // Delete from Vercel Blob storage
  await del(record.url);

  // Remove the DB record
  await db.delete(media).where(eq(media.id, id));
}

// Saves a media record after a Vercel Blob upload completes
export async function saveMediaRecord(data: {
  filename: string;
  url: string;
  alt?: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
}) {
  const session = await auth();
  requireCan(session, "create", "media");

  const [newMedia] = await db
    .insert(media)
    .values({
      filename: data.filename,
      url: data.url,
      alt: data.alt ?? "",
      mimeType: data.mimeType,
      size: data.size,
      width: data.width,
      height: data.height,
      uploadedBy: session!.user!.id,
    })
    .returning();

  return newMedia;
}

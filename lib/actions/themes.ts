"use server";

import { db } from "@/lib/db";
import { themes } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Gets the currently active theme config
export async function getActiveTheme() {
  try {
    const [theme] = await db
      .select()
      .from(themes)
      .where(eq(themes.isActive, true))
      .limit(1);

    return theme ?? null;
  } catch (error) {
    console.error("getActiveTheme error:", error);
    return null;
  }
}

export async function getThemes() {
  return await db.select().from(themes).orderBy(desc(themes.createdAt));
}

export async function getThemeById(id: string) {
  const [theme] = await db.select().from(themes).where(eq(themes.id, id)).limit(1);
  return theme ?? null;
}

export async function createTheme(data: { name: string; slug: string; config: Record<string, unknown> }) {
  const [newTheme] = await db
    .insert(themes)
    .values({
      name: data.name,
      slug: data.slug,
      config: data.config,
    })
    .returning();
  
  revalidatePath("/admin/themes");
  return newTheme;
}

export async function updateTheme(id: string, data: { name: string; config: Record<string, unknown> }) {
  const [updatedTheme] = await db
    .update(themes)
    .set({
      name: data.name,
      config: data.config,
      updatedAt: new Date(),
    })
    .where(eq(themes.id, id))
    .returning();
  
  revalidatePath("/admin/themes");
  revalidatePath("/");
  return updatedTheme;
}

export async function deleteTheme(id: string) {
  // Prevent deleting the active theme if possible, but for now just delete
  await db.delete(themes).where(eq(themes.id, id));
  revalidatePath("/admin/themes");
}

export async function setActiveTheme(id: string) {
  // First, set all themes to inactive
  await db.update(themes).set({ isActive: false });
  // Then set the selected theme to active
  await db.update(themes).set({ isActive: true, updatedAt: new Date() }).where(eq(themes.id, id));
  
  revalidatePath("/");
  revalidatePath("/admin/themes");
}

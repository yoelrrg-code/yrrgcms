"use server";

import { db } from "@/lib/db";
import { courseModules, courseLessons, courses } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function addModule(courseId: string, title: string, order: number = 0) {
  const [newMod] = await db
    .insert(courseModules)
    .values({
      courseId,
      title,
      order,
    })
    .returning();

  revalidatePath("/admin/courses");
  return newMod;
}

export async function deleteModule(moduleId: string) {
  await db.delete(courseModules).where(eq(courseModules.id, moduleId));
  revalidatePath("/admin/courses");
}

export async function addLesson(data: {
  moduleId: string;
  title: string;
  contentType: "VIDEO" | "WEBINAR_LINK" | "PDF_DOCUMENT";
  contentUrl: string;
  duration?: string;
  isFreePreview?: boolean;
  order?: number;
}) {
  const [newLesson] = await db
    .insert(courseLessons)
    .values({
      moduleId: data.moduleId,
      title: data.title,
      contentType: data.contentType,
      contentUrl: data.contentUrl,
      duration: data.duration,
      isFreePreview: data.isFreePreview ?? false,
      order: data.order ?? 0,
    })
    .returning();

  revalidatePath("/admin/courses");
  return newLesson;
}

export async function updateLesson(
  lessonId: string,
  data: Partial<{
    title: string;
    contentType: "VIDEO" | "WEBINAR_LINK" | "PDF_DOCUMENT";
    contentUrl: string;
    duration: string;
    isFreePreview: boolean;
  }>
) {
  const [updated] = await db
    .update(courseLessons)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(courseLessons.id, lessonId))
    .returning();

  revalidatePath("/admin/cursos");
  return updated;
}

export async function deleteLesson(lessonId: string) {
  await db.delete(courseLessons).where(eq(courseLessons.id, lessonId));
  revalidatePath("/admin/cursos");
}

export async function updateCourseLevel(courseId: string, level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED") {
  await db
    .update(courses)
    .set({ level, updatedAt: new Date() })
    .where(eq(courses.id, courseId));

  revalidatePath("/admin/cursos");
}

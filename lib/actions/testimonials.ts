"use server";

import { db } from "@/lib/db";
import { testimonials, NewTestimonial } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// ==========================================
// TESTIMONIALS ACTIONS
// ==========================================

export async function getTestimonials() {
  try {
    return await db.select().from(testimonials).orderBy(asc(testimonials.order), asc(testimonials.createdAt));
  } catch (error: unknown) {
    console.error("Error fetching testimonials:", error);
    return [];
  }
}

export async function createTestimonial(data: NewTestimonial) {
  try {
    const [created] = await db.insert(testimonials).values(data).returning();
    revalidatePath("/admin/testimonials");
    revalidatePath("/");
    return { success: true, data: created };
  } catch (error: unknown) {
    console.error("Error creating testimonial:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create testimonial",
    };
  }
}

export async function updateTestimonial(id: string, data: Partial<NewTestimonial>) {
  try {
    const [updated] = await db
      .update(testimonials)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(testimonials.id, id))
      .returning();
    revalidatePath("/admin/testimonials");
    revalidatePath("/");
    return { success: true, data: updated };
  } catch (error: unknown) {
    console.error("Error updating testimonial:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update testimonial",
    };
  }
}

export async function deleteTestimonial(id: string) {
  try {
    await db.delete(testimonials).where(eq(testimonials.id, id));
    revalidatePath("/admin/testimonials");
    revalidatePath("/");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error deleting testimonial:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete testimonial",
    };
  }
}

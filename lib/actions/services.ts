"use server";

import { db } from "@/lib/db";
import { services, availabilitySettings, appointments, NewService, NewAppointment } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// ==========================================
// SERVICES ACTIONS
// ==========================================

export async function getServices() {
  try {
    return await db.select().from(services).orderBy(desc(services.createdAt));
  } catch (error) {
    console.error("Error fetching services:", error);
    return [];
  }
}

export async function getServiceBySlug(slug: string) {
  try {
    const res = await db.select().from(services).where(eq(services.slug, slug)).limit(1);
    return res[0] || null;
  } catch (error) {
    console.error("Error fetching service by slug:", error);
    return null;
  }
}

export async function createService(data: NewService) {
  try {
    const [created] = await db.insert(services).values(data).returning();
    revalidatePath("/admin/services");
    return { success: true, data: created };
  } catch (error) {
    console.error("Error creating service:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to create service" };
  }
}

export async function updateService(id: string, data: Partial<NewService>) {
  try {
    const [updated] = await db
      .update(services)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(services.id, id))
      .returning();
    revalidatePath("/admin/services");
    return { success: true, data: updated };
  } catch (error) {
    console.error("Error updating service:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to update service" };
  }
}

export async function deleteService(id: string) {
  try {
    await db.delete(services).where(eq(services.id, id));
    revalidatePath("/admin/services");
    return { success: true };
  } catch (error) {
    console.error("Error deleting service:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete service" };
  }
}

// ==========================================
// APPOINTMENTS ACTIONS
// ==========================================

export async function getAppointments() {
  try {
    return await db.select().from(appointments).orderBy(desc(appointments.createdAt));
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return [];
  }
}

export async function createAppointment(data: NewAppointment) {
  try {
    const [created] = await db.insert(appointments).values(data).returning();
    revalidatePath("/admin/schedule");
    return { success: true, data: created };
  } catch (error) {
    console.error("Error creating appointment:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to create appointment" };
  }
}

export async function updateAppointmentStatus(id: string, status: "confirmed" | "completed" | "cancelled" | "no_show", paymentStatus?: "pending_onsite" | "paid") {
  try {
    const updateData: { status: "confirmed" | "completed" | "cancelled" | "no_show"; updatedAt: Date; paymentStatus?: "pending_onsite" | "paid" } = { status, updatedAt: new Date() };
    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }
    const [updated] = await db
      .update(appointments)
      .set(updateData)
      .where(eq(appointments.id, id))
      .returning();
    revalidatePath("/admin/schedule");
    return { success: true, data: updated };
  } catch (error) {
    console.error("Error updating appointment status:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to update appointment status" };
  }
}

export async function deleteAppointment(id: string) {
  try {
    await db.delete(appointments).where(eq(appointments.id, id));
    revalidatePath("/admin/schedule");
    return { success: true };
  } catch (error) {
    console.error("Error deleting appointment:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete appointment" };
  }
}

// ==========================================
// AVAILABILITY SETTINGS ACTIONS
// ==========================================

export async function getAvailabilitySettings(serviceId?: string) {
  try {
    if (serviceId) {
      const res = await db.select().from(availabilitySettings).where(eq(availabilitySettings.serviceId, serviceId)).limit(1);
      if (res[0]) return res[0];
    }
    // Global fallback
    const globalRes = await db.select().from(availabilitySettings).limit(1);
    return globalRes[0] || null;
  } catch (error) {
    console.error("Error fetching availability settings:", error);
    return null;
  }
}

export async function saveAvailabilitySettings(data: Record<string, unknown>) {
  try {
    if (data.id && typeof data.id === "string") {
      const [updated] = await db
        .update(availabilitySettings)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(availabilitySettings.id, data.id))
        .returning();
      revalidatePath("/admin/schedule/settings");
      return { success: true, data: updated };
    } else {
      const [created] = await db.insert(availabilitySettings).values(data as unknown as typeof availabilitySettings.$inferInsert).returning();
      revalidatePath("/admin/schedule/settings");
      return { success: true, data: created };
    }
  } catch (error) {
    console.error("Error saving availability settings:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to save availability settings" };
  }
}

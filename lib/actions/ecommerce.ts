"use server";

import { db } from "@/lib/db";
import { products, courses, orders, orderItems, enrollments, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

export async function createOrderAction(formData: FormData) {
  try {
    const productId = formData.get("productId") as string;
    const customerName = formData.get("customerName") as string;
    const customerEmail = formData.get("customerEmail") as string;
    const proofOfPaymentUrl = (formData.get("proofOfPaymentUrl") as string) || null;
    const userId = (formData.get("userId") as string) || null;

    if (!productId || !customerName || !customerEmail) {
      return { success: false, error: "Missing required fields" };
    }

    const [product] = await db.select().from(products).where(eq(products.id, productId));
    if (!product) {
      return { success: false, error: "Product not found" };
    }

    const [order] = await db.insert(orders).values({
      userId: userId || undefined,
      customerName,
      customerEmail,
      totalAmount: product.price,
      currency: product.currency,
      status: "PENDING_PAYMENT",
      paymentMethod: "BANK_TRANSFER",
      proofOfPaymentUrl,
    }).returning();

    await db.insert(orderItems).values({
      orderId: order.id,
      productId: product.id,
      priceAtPurchase: product.price,
    });

    revalidatePath("/admin/ventas");
    return { success: true, orderId: order.id };
  } catch (err: unknown) {
    console.error("createOrderAction error:", err);
    const errorMessage = err instanceof Error ? err.message : "Failed to create order";
    return { success: false, error: errorMessage };
  }
}

export async function approveOrderAction(orderId: string) {
  try {
    const session = await auth();
    const userRole = (session?.user as { role?: string } | undefined)?.role;
    if (!session?.user || userRole !== "ADMIN") {
      return { success: false, error: "Unauthorized access" };
    }

    const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
    if (!order) return { success: false, error: "Order not found" };

    // Update Order Status
    await db.update(orders).set({ status: "APPROVED", updatedAt: new Date() }).where(eq(orders.id, orderId));

    // Get order items
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));

    // Find or create target user for enrollment
    let targetUserId = order.userId;

    // Search user by email regardless of current order.userId to ensure existing users (admin, author, customer) are matched
    if (order.customerEmail) {
      const [existingUser] = await db.select().from(users).where(eq(users.email, order.customerEmail));
      if (existingUser) {
        targetUserId = existingUser.id;
        if (order.userId !== existingUser.id) {
          await db.update(orders).set({ userId: existingUser.id }).where(eq(orders.id, order.id));
        }
      } else if (!targetUserId) {
        // Create new user with customer role if no user exists with this email
        const bcrypt = (await import("bcryptjs")).default;
        const tempPasswordHash = await bcrypt.hash(Math.random().toString(36).slice(-8) + "Aa1!", 10);
        
        const [newUser] = await db
          .insert(users)
          .values({
            name: order.customerName,
            email: order.customerEmail,
            passwordHash: tempPasswordHash,
            role: "customer",
          })
          .returning();
        
        targetUserId = newUser.id;
        await db.update(orders).set({ userId: newUser.id }).where(eq(orders.id, order.id));
      }
    }

    for (const item of items) {
      const [course] = await db.select().from(courses).where(eq(courses.productId, item.productId));
      if (course && targetUserId) {
        // Check if enrollment exists
        const [existing] = await db.select().from(enrollments).where(
          and(eq(enrollments.userId, targetUserId), eq(enrollments.courseId, course.id))
        );

        if (!existing) {
          await db.insert(enrollments).values({
            userId: targetUserId,
            courseId: course.id,
            orderId: order.id,
            isActive: true,
          });
        } else {
          await db.update(enrollments).set({ isActive: true }).where(eq(enrollments.id, existing.id));
        }
      }
    }

    revalidatePath("/admin/ventas");
    revalidatePath("/my-account/courses");
    return { success: true };
  } catch (err: unknown) {
    console.error("approveOrderAction error:", err);
    const errorMessage = err instanceof Error ? err.message : "Failed to approve order";
    return { success: false, error: errorMessage };
  }
}

export async function rejectOrderAction(orderId: string) {
  try {
    const session = await auth();
    const userRole = (session?.user as { role?: string } | undefined)?.role;
    if (!session?.user || userRole !== "ADMIN") {
      return { success: false, error: "Unauthorized access" };
    }

    await db.update(orders).set({ status: "REJECTED", updatedAt: new Date() }).where(eq(orders.id, orderId));
    revalidatePath("/admin/ventas");
    return { success: true };
  } catch (err: unknown) {
    console.error("rejectOrderAction error:", err);
    const errorMessage = err instanceof Error ? err.message : "Failed to reject order";
    return { success: false, error: errorMessage };
  }
}

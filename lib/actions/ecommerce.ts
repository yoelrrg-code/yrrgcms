"use server";

import { db } from "@/lib/db";
import { products, courses, orders, orderItems, enrollments, users } from "@/lib/db/schema";
import { eq, and, ilike } from "drizzle-orm";
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

    const normalizedEmail = customerEmail.trim().toLowerCase();
    const normalizedName = customerName.trim();
    const password = (formData.get("password") as string) || null;

    let finalUserId = userId;

    if (!finalUserId) {
      const bcrypt = (await import("bcryptjs")).default;
      const passwordHash = await bcrypt.hash(password || "TempPass123!", 10);

      // Atomic upsert: insert if not exists, do nothing on conflict
      await db
        .insert(users)
        .values({
          name: normalizedName,
          email: normalizedEmail,
          passwordHash,
          role: "customer",
        })
        .onConflictDoNothing({ target: users.email });

      // Always fetch the user after upsert (new or existing)
      const [resolvedUser] = await db
        .select()
        .from(users)
        .where(ilike(users.email, normalizedEmail));

      if (resolvedUser) {
        finalUserId = resolvedUser.id;
      }
    }

    const shippingAddress = (formData.get("shippingAddress") as string) || null;

    const [order] = await db.insert(orders).values({
      userId: finalUserId || undefined,
      customerName: normalizedName,
      customerEmail: normalizedEmail,
      totalAmount: product.price,
      currency: product.currency,
      status: "PENDING_PAYMENT",
      paymentMethod: "BANK_TRANSFER",
      proofOfPaymentUrl,
      shippingAddress,
    }).returning();

    await db.insert(orderItems).values({
      orderId: order.id,
      productId: product.id,
      priceAtPurchase: product.price,
    });

    revalidatePath("/admin/payments");
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
    if (!session?.user || userRole !== "admin") {
      throw new Error("Unauthorized access");
    }

    const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
    if (!order) throw new Error("Order not found");

    // Update Order Status
    await db.update(orders).set({ status: "APPROVED", updatedAt: new Date() }).where(eq(orders.id, orderId));

    // Get order items
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));

    // Find or create target user for enrollment
    let targetUserId = order.userId;

    // Search user by email (case-insensitive) to ensure existing users are matched
    if (order.customerEmail) {
      const normalizedEmail = order.customerEmail.trim().toLowerCase();
      const [existingUser] = await db.select().from(users).where(ilike(users.email, normalizedEmail));
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
            email: normalizedEmail,
            passwordHash: tempPasswordHash,
            role: "customer",
          })
          .returning();
        
        targetUserId = newUser.id;
        await db.update(orders).set({ userId: newUser.id }).where(eq(orders.id, order.id));
      }
    }

    for (const item of items) {
      let [course] = await db.select().from(courses).where(eq(courses.productId, item.productId));
      
      // Fallback: If course record doesn't exist yet for this product, auto-create it
      if (!course) {
        const [prod] = await db.select().from(products).where(eq(products.id, item.productId));
        if (prod && prod.type === "VIRTUAL_COURSE") {
          const [newCourse] = await db.insert(courses).values({
            productId: prod.id,
            level: "BEGINNER",
          }).returning();
          course = newCourse;
        }
      }

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

    // Trigger email notification to customer with product details / download URL / shipping details
    try {
      const { sendOrderApprovalEmail } = await import("@/lib/services/email-sender");
      const emailItems = await Promise.all(
        items.map(async (item) => {
          const [p] = await db.select().from(products).where(eq(products.id, item.productId));
          return {
            productTitle: p?.title || "Producto",
            productType: p?.type || "VIRTUAL_COURSE",
            downloadUrl: p?.downloadUrl,
          };
        })
      );

      await sendOrderApprovalEmail({
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        orderId: order.id,
        totalAmount: order.totalAmount,
        currency: order.currency,
        shippingAddress: order.shippingAddress,
        items: emailItems,
      });
    } catch (emailErr) {
      console.error("Failed to send order approval email notification:", emailErr);
    }

    revalidatePath("/admin/payments");
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
    if (!session?.user || userRole !== "admin") {
      throw new Error("Unauthorized access");
    }

    await db.update(orders).set({ status: "REJECTED", updatedAt: new Date() }).where(eq(orders.id, orderId));
    revalidatePath("/admin/payments");
    return { success: true };
  } catch (err: unknown) {
    console.error("rejectOrderAction error:", err);
    const errorMessage = err instanceof Error ? err.message : "Failed to reject order";
    return { success: false, error: errorMessage };
  }
}

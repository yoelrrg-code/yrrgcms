"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function updateProfileAction(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized access" };
    }

    const name = formData.get("name") as string;
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;

    if (!name || name.trim().length === 0) {
      return { success: false, error: "Full name is required." };
    }

    const [user] = await db.select().from(users).where(eq(users.id, session.user.id));
    if (!user) {
      return { success: false, error: "User not found." };
    }

    const updateData: { name: string; passwordHash?: string; updatedAt: Date } = {
      name: name.trim(),
      updatedAt: new Date(),
    };

    if (newPassword && newPassword.trim().length > 0) {
      if (!currentPassword) {
        return { success: false, error: "Current password is required to update password." };
      }

      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch) {
        return { success: false, error: "Current password is incorrect." };
      }

      if (newPassword.trim().length < 6) {
        return { success: false, error: "New password must be at least 6 characters." };
      }

      updateData.passwordHash = await bcrypt.hash(newPassword.trim(), 10);
    }

    await db.update(users).set(updateData).where(eq(users.id, user.id));

    revalidatePath("/my-account");
    return { success: true };
  } catch (err: unknown) {
    console.error("updateProfileAction error:", err);
    const errorMessage = err instanceof Error ? err.message : "Failed to update profile";
    return { success: false, error: errorMessage };
  }
}

"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { requireCan } from "@/lib/permissions";
import { eq, desc } from "drizzle-orm";
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

// Returns all users ordered by createdAt desc, without passwordHash
export async function getUsers() {
  const session = await auth();
  requireCan(session, "manage", "users");

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      lastLogin: users.lastLogin,
    })
    .from(users)
    .orderBy(desc(users.createdAt));

  return rows;
}

// Returns a single user without passwordHash
export async function getUserById(id: string) {
  const session = await auth();
  requireCan(session, "manage", "users");

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      lastLogin: users.lastLogin,
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return user ?? null;
}

// Creates a new user with hashed password
export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role: "admin" | "author";
}) {
  const session = await auth();
  requireCan(session, "manage", "users");

  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

  const [newUser] = await db
    .insert(users)
    .values({
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role,
    })
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      lastLogin: users.lastLogin,
    });

  return newUser;
}

// Updates a user; hashes password only if a new one is supplied
export async function updateUser(
  id: string,
  data: {
    name?: string;
    email?: string;
    password?: string;
    role?: "admin" | "author";
  }
) {
  const session = await auth();
  requireCan(session, "manage", "users");

  const updatePayload: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  if (data.name !== undefined) updatePayload.name = data.name;
  if (data.email !== undefined) updatePayload.email = data.email;
  if (data.role !== undefined) updatePayload.role = data.role;
  if (data.password && data.password.trim() !== "") {
    updatePayload.passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
  }

  const [updated] = await db
    .update(users)
    .set(updatePayload)
    .where(eq(users.id, id))
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      lastLogin: users.lastLogin,
    });

  return updated;
}

// Deletes a user; prevents self-deletion
export async function deleteUser(id: string) {
  const session = await auth();
  requireCan(session, "manage", "users");

  if (id === session?.user?.id) {
    throw new Error("You cannot delete your own account.");
  }

  await db.delete(users).where(eq(users.id, id));
}

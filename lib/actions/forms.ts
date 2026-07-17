"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { forms, formSubmissions } from "@/lib/db/schema";
import { requireCan } from "@/lib/permissions";
import { eq, desc } from "drizzle-orm";

// Returns all forms
export async function getForms() {
  const session = await auth();
  requireCan(session, "manage", "forms");

  return db.select().from(forms).orderBy(desc(forms.createdAt));
}

// Returns a single form by id
export async function getFormById(id: string) {
  const session = await auth();
  requireCan(session, "manage", "forms");

  const [form] = await db
    .select()
    .from(forms)
    .where(eq(forms.id, id))
    .limit(1);

  return form ?? null;
}

// Creates a new form
export async function createForm(data: {
  name: string;
  fields: unknown;
  notifyEmail?: string;
  successMessage?: string;
}) {
  const session = await auth();
  requireCan(session, "manage", "forms");

  const [newForm] = await db
    .insert(forms)
    .values({
      name: data.name,
      fields: data.fields ?? [],
      notifyEmail: data.notifyEmail,
      successMessage:
        data.successMessage ?? "Thank you! We'll be in touch.",
    })
    .returning();

  return newForm;
}

// Updates a form
export async function updateForm(
  id: string,
  data: {
    name?: string;
    fields?: unknown;
    notifyEmail?: string;
    successMessage?: string;
  }
) {
  const session = await auth();
  requireCan(session, "manage", "forms");

  const [updated] = await db
    .update(forms)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(forms.id, id))
    .returning();

  return updated;
}

// Deletes a form; admin only (manage = admin-only resource)
export async function deleteForm(id: string) {
  const session = await auth();
  requireCan(session, "manage", "forms");

  await db.delete(forms).where(eq(forms.id, id));
}

// Returns submissions for a given form
export async function getFormSubmissions(formId: string) {
  const session = await auth();
  requireCan(session, "manage", "form_submissions");

  return db
    .select()
    .from(formSubmissions)
    .where(eq(formSubmissions.formId, formId))
    .orderBy(desc(formSubmissions.submittedAt));
}

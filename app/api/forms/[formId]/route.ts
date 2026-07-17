import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { forms } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * GET /api/forms/[formId]
 *
 * Public endpoint – no auth required.
 * Returns the form's field configuration and success message.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  const { formId } = await params;

  if (!formId) {
    return NextResponse.json({ error: "formId is required" }, { status: 400 });
  }

  const [form] = await db
    .select({
      id: forms.id,
      name: forms.name,
      fields: forms.fields,
      successMessage: forms.successMessage,
    })
    .from(forms)
    .where(eq(forms.id, formId))
    .limit(1);

  if (!form) {
    return NextResponse.json({ error: "Form not found" }, { status: 404 });
  }

  return NextResponse.json(form, {
    headers: {
      // Cache for 60 seconds; stale-while-revalidate for 5 minutes
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}

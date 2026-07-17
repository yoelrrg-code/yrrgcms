import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { forms, formSubmissions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

// ── Validation schema ─────────────────────────────────────────

const submitSchema = z.object({
  formId: z.string().uuid("formId must be a valid UUID"),
  data: z.record(z.string(), z.unknown()),
});

// ── Simple in-memory rate limiter ─────────────────────────────
// Stores { timestamp[] } per IP. Allows max 5 submissions per 60 seconds.
// In production you would replace this with a Redis-backed solution.

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 5;
const ipMap = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (ipMap.get(ip) ?? []).filter(
    (t) => now - t < WINDOW_MS
  );

  if (timestamps.length >= MAX_REQUESTS) {
    return true;
  }

  timestamps.push(now);
  ipMap.set(ip, timestamps);
  return false;
}

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

// ── Handler ───────────────────────────────────────────────────

/**
 * POST /api/forms/submit
 *
 * Body: { formId: string, data: Record<string, unknown> }
 *
 * Validates that the form exists, checks rate limit, then inserts
 * a row into form_submissions.
 */
export async function POST(req: NextRequest) {
  // 1. Rate limiting
  const ip = getClientIp(req);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many submissions. Please wait a moment and try again." },
      { status: 429 }
    );
  }

  // 2. Parse body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // 3. Validate schema
  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const { formId, data } = parsed.data;

  // 4. Verify form exists
  const [form] = await db
    .select({ id: forms.id, successMessage: forms.successMessage })
    .from(forms)
    .where(eq(forms.id, formId))
    .limit(1);

  if (!form) {
    return NextResponse.json({ error: "Form not found" }, { status: 404 });
  }

  // 5. Persist submission
  await db.insert(formSubmissions).values({
    formId: form.id,
    data: data as Record<string, unknown>,
    ip,
    userAgent: req.headers.get("user-agent") ?? null,
  });

  return NextResponse.json(
    { success: true, message: form.successMessage },
    { status: 201 }
  );
}

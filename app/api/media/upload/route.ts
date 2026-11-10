import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { put } from "@vercel/blob";
import { saveMediaRecord } from "@/lib/actions/media";

const MAX_MEDIA_SIZE = 10 * 1024 * 1024; // 10 MB for admin media
const MAX_PROOF_SIZE = 5 * 1024 * 1024;  // 5 MB for payment receipts

const ALLOWED_ADMIN_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "application/pdf",
]);

const ALLOWED_PROOF_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

// Dangerous extensions that must never be uploaded
const DISALLOWED_EXTENSIONS = /\.(html?|svg|php|exe|sh|bat|cmd|js|mjs|jsx|tsx?|py|cgi|jar)$/i;

// In-memory rate limiter for public upload submissions (max 10 uploads per 10 mins per IP)
const ipUploads = new Map<string, number[]>();
const RATE_WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 10;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (ipUploads.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }
  timestamps.push(now);
  ipUploads.set(ip, timestamps);
  return false;
}

export async function POST(request: NextRequest) {
  const session = await auth();
  const userRole = (session?.user as { role?: string } | undefined)?.role;
  const isAdminOrAuthor = Boolean(session?.user && (userRole === "admin" || userRole === "author"));

  // If not admin/author, apply rate-limiting to guest upload attempts
  if (!isAdminOrAuthor) {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many upload attempts. Please wait a few minutes." },
        { status: 429 }
      );
    }
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid form data." },
      { status: 400 }
    );
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: "No file provided. Send a multipart/form-data request with a 'file' field." },
      { status: 400 }
    );
  }

  // Prevent file name extension exploits
  if (DISALLOWED_EXTENSIONS.test(file.name)) {
    return NextResponse.json(
      { error: "This file type is not allowed for security reasons." },
      { status: 400 }
    );
  }

  const fileMime = file.type || "application/octet-stream";

  if (isAdminOrAuthor) {
    if (!ALLOWED_ADMIN_MIMES.has(fileMime)) {
      return NextResponse.json(
        { error: "Unsupported file format. Allowed: images, videos, PDF." },
        { status: 415 }
      );
    }

    if (file.size > MAX_MEDIA_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum allowed size is 10 MB." },
        { status: 413 }
      );
    }

    // Upload to Vercel Blob and save to library
    const blob = await put(file.name, file, {
      access: "public",
      contentType: fileMime,
    });

    try {
      const record = await saveMediaRecord({
        filename: file.name,
        url: blob.url,
        alt: "",
        mimeType: fileMime,
        size: file.size,
      });
      return NextResponse.json(record, { status: 201 });
    } catch (saveErr) {
      console.warn("Could not save media record in library (continuing with blob url):", saveErr);
      return NextResponse.json({ url: blob.url, filename: file.name }, { status: 201 });
    }
  } else {
    // Unauthenticated / Customer uploads are strictly limited to payment receipts
    if (!ALLOWED_PROOF_MIMES.has(fileMime)) {
      return NextResponse.json(
        { error: "Receipt must be an image (JPG, PNG, WEBP) or PDF." },
        { status: 415 }
      );
    }

    if (file.size > MAX_PROOF_SIZE) {
      return NextResponse.json(
        { error: "Receipt file too large. Maximum allowed size is 5 MB." },
        { status: 413 }
      );
    }

    // Upload receipt to Vercel Blob
    const safeFilename = `receipt-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const blob = await put(safeFilename, file, {
      access: "public",
      contentType: fileMime,
    });

    return NextResponse.json({ url: blob.url, filename: safeFilename }, { status: 201 });
  }
}

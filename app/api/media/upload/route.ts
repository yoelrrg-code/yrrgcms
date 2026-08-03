import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { put } from "@vercel/blob";
import { saveMediaRecord } from "@/lib/actions/media";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(request: NextRequest) {
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

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: `File too large. Maximum allowed size is 10 MB.` },
      { status: 413 }
    );
  }

  // Upload to Vercel Blob
  const blob = await put(file.name, file, {
    access: "public",
    contentType: file.type || "application/octet-stream",
  });

  // Authenticate session if saving media record in CMS library
  const session = await auth();
  if (session?.user) {
    const record = await saveMediaRecord({
      filename: file.name,
      url: blob.url,
      alt: "",
      mimeType: file.type || "application/octet-stream",
      size: file.size,
    });
    return NextResponse.json(record, { status: 201 });
  }

  return NextResponse.json({ url: blob.url, filename: file.name }, { status: 201 });
}

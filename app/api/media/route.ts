import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getMedia } from "@/lib/actions/media";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await getMedia();
    return NextResponse.json(result);
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to fetch media" }, { status: 500 });
  }
}

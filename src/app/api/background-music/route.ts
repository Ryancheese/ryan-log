import { NextResponse } from "next/server";
import {
  getBackgroundMusicConfig,
  saveBackgroundMusicConfig,
  verifyAdminSecret,
} from "@/lib/background-music";

export async function GET() {
  const config = await getBackgroundMusicConfig();
  return NextResponse.json(config);
}

export async function PUT(request: Request) {
  if (!verifyAdminSecret(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const config = await saveBackgroundMusicConfig({
      enabled: typeof body.enabled === "boolean" ? body.enabled : undefined,
      title: typeof body.title === "string" ? body.title : undefined,
      volume: typeof body.volume === "number" ? body.volume : undefined,
      loop: typeof body.loop === "boolean" ? body.loop : undefined,
    });
    return NextResponse.json(config);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

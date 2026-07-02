import { NextResponse } from "next/server";
import { uploadBackgroundMusic, verifyAdminSecret } from "@/lib/background-music";

export async function POST(request: Request) {
  if (!verifyAdminSecret(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const config = await uploadBackgroundMusic(file);
    return NextResponse.json(config);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "UNSUPPORTED_FORMAT") {
        return NextResponse.json({ error: "Unsupported audio format" }, { status: 400 });
      }
      if (error.message === "FILE_TOO_LARGE") {
        return NextResponse.json({ error: "File too large (max 15MB)" }, { status: 400 });
      }
      if (error.message === "EMPTY_FILE") {
        return NextResponse.json({ error: "Empty file" }, { status: 400 });
      }
    }
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

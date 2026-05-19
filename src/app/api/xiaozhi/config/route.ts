import { NextResponse } from "next/server";
import { isXiaozhiConfigured } from "@/lib/xiaozhi";
import { getXiaozhiVoiceMode, shouldUseServerChat } from "@/lib/xiaozhi-deploy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isFastConfigured() {
  return Boolean(process.env.DEEPSEEK_API_KEY?.trim());
}

export async function GET() {
  const fastEnabled = isFastConfigured();
  const xiaozhiEnabled = isXiaozhiConfigured();
  const useServerChat = shouldUseServerChat();

  return NextResponse.json({
    enabled: fastEnabled || xiaozhiEnabled,
    fastEnabled,
    xiaozhiEnabled,
    useServerChat,
    voiceMode: getXiaozhiVoiceMode(),
  });
}

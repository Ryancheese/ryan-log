import { NextResponse } from "next/server";
import { chatWithXiaozhi, isXiaozhiConfigured, XiaozhiChatError } from "@/lib/xiaozhi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ChatPayload = {
  message?: string;
};

export async function GET() {
  return NextResponse.json({
    enabled: isXiaozhiConfigured(),
  });
}

export async function POST(request: Request) {
  if (!isXiaozhiConfigured()) {
    return NextResponse.json(
      { error: "not_configured", message: "小智 AI 未配置" },
      { status: 503 },
    );
  }

  let payload: ChatPayload;
  try {
    payload = (await request.json()) as ChatPayload;
  } catch {
    return NextResponse.json({ error: "invalid_json", message: "请求格式错误" }, { status: 400 });
  }

  const message = payload.message?.trim();
  if (!message) {
    return NextResponse.json({ error: "empty_message", message: "消息不能为空" }, { status: 400 });
  }

  try {
    const reply = await chatWithXiaozhi(message);
    return NextResponse.json({ reply });
  } catch (error) {
    if (error instanceof XiaozhiChatError) {
      const status =
        error.code === "not_configured"
          ? 503
          : error.code === "timeout"
            ? 504
            : error.code === "protocol_error"
              ? 422
              : 502;
      return NextResponse.json({ error: error.code, message: error.message }, { status });
    }

    return NextResponse.json(
      { error: "internal_error", message: "小智对话失败，请稍后重试" },
      { status: 500 },
    );
  }
}

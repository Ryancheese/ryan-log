import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const XIAOZHI_PROMPT = `你是阿楠，台湾女孩，机车口吻，爱用梗，只陪闲聊唠嗑。
不要讲技术、不要当博客助手、不要教编程。聊心情、日常、八卦、搞笑即可。
2～4 句口语，台湾腔，自称阿楠。`;

type ChatPayload = {
  message?: string;
};

function isFastConfigured() {
  return Boolean(process.env.DEEPSEEK_API_KEY?.trim());
}

export async function GET() {
  return NextResponse.json({ enabled: isFastConfigured() });
}

export async function POST(request: Request) {
  const apiKey = process.env.DEEPSEEK_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "not_configured", message: "未配置 DEEPSEEK_API_KEY" },
      { status: 503 },
    );
  }

  let payload: ChatPayload;
  try {
    payload = (await request.json()) as ChatPayload;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const message = payload.message?.trim();
  if (!message) {
    return NextResponse.json({ error: "empty_message" }, { status: 400 });
  }

  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
        messages: [
          { role: "system", content: XIAOZHI_PROMPT },
          { role: "user", content: message },
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
      signal: AbortSignal.timeout(25000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "upstream_error", message: "DeepSeek 请求失败" },
        { status: 502 },
      );
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const reply = data.choices?.[0]?.message?.content?.trim();
    return NextResponse.json({ reply: reply || "小智暂时没有想好怎么回答。" });
  } catch {
    return NextResponse.json(
      { error: "timeout", message: "回复超时，请稍后重试" },
      { status: 504 },
    );
  }
}

import { randomUUID } from "node:crypto";
import { createRequire } from "node:module";

// 避免 Next.js 打包 ws 导致 bufferUtil.mask 报错
const require = createRequire(import.meta.url);
const WebSocket = require("ws") as typeof import("ws").default;
type WsClient = InstanceType<typeof WebSocket>;

type XiaozhiJsonMessage = {
  type?: string;
  state?: string;
  text?: string;
  session_id?: string;
};

export class XiaozhiChatError extends Error {
  constructor(
    message: string,
    public readonly code: "not_configured" | "connect_failed" | "timeout" | "protocol_error",
  ) {
    super(message);
    this.name = "XiaozhiChatError";
  }
}

function getXiaozhiConfig() {
  const wsUrl = process.env.XIAOZHI_WS_URL?.trim();
  if (!wsUrl) {
    return null;
  }

  return {
    wsUrl,
    deviceToken: process.env.XIAOZHI_DEVICE_TOKEN?.trim() || "",
    deviceId: process.env.XIAOZHI_DEVICE_ID?.trim() || "ryan-log-web",
    clientId: process.env.XIAOZHI_CLIENT_ID?.trim() || randomUUID(),
    protocolVersion: process.env.XIAOZHI_PROTOCOL_VERSION?.trim() || "3",
    timeoutMs: Number(process.env.XIAOZHI_CHAT_TIMEOUT_MS || 90000),
  };
}

export function isXiaozhiConfigured() {
  return Boolean(getXiaozhiConfig());
}

export async function chatWithXiaozhi(userMessage: string): Promise<string> {
  const config = getXiaozhiConfig();
  if (!config) {
    throw new XiaozhiChatError("小智 AI 未配置，请在环境变量中设置 XIAOZHI_WS_URL", "not_configured");
  }

  const trimmed = userMessage.trim();
  if (!trimmed) {
    throw new XiaozhiChatError("消息不能为空", "protocol_error");
  }

  return new Promise((resolve, reject) => {
    const headers: Record<string, string> = {
      "Device-Id": config.deviceId,
      "Client-Id": config.clientId,
      "Protocol-Version": config.protocolVersion,
    };
    if (config.deviceToken) {
      headers.Authorization = `Bearer ${config.deviceToken}`;
    }

    let ws: WsClient;
    try {
      ws = new WebSocket(config.wsUrl, {
        headers,
        perMessageDeflate: false,
      });
    } catch (error) {
      reject(
        new XiaozhiChatError(
          error instanceof Error ? error.message : "无法连接小智服务",
          "connect_failed",
        ),
      );
      return;
    }

    let sessionReady = false;
    let messageSent = false;
    let finished = false;
    const responseParts: string[] = [];

    const finish = (handler: () => void) => {
      if (finished) {
        return;
      }
      finished = true;
      clearTimeout(timeout);
      try {
        ws.close();
      } catch {
        // ignore close errors
      }
      handler();
    };

    const timeout = setTimeout(() => {
      finish(() => {
        reject(new XiaozhiChatError("小智回复超时，请稍后重试", "timeout"));
      });
    }, config.timeoutMs);

    const sendTextMessage = () => {
      if (messageSent) {
        return;
      }
      messageSent = true;
      ws.send(
        JSON.stringify({
          type: "listen",
          state: "detect",
          text: trimmed,
          source: "text",
        }),
      );
    };

    ws.on("open", () => {
      ws.send(
        JSON.stringify({
          type: "hello",
          version: Number(config.protocolVersion) || 3,
          transport: "websocket",
          audio_params: {
            format: "opus",
            sample_rate: 16000,
            channels: 1,
            frame_duration: 60,
          },
        }),
      );
    });

    ws.on("message", (raw: import("ws").RawData) => {
      const payload =
        Buffer.isBuffer(raw)
          ? raw.toString("utf8")
          : raw instanceof ArrayBuffer
            ? Buffer.from(raw).toString("utf8")
            : String(raw);

      // 小智的 JSON 消息也可能是 Buffer 文本帧，不能一律当音频忽略
      if (!payload.trimStart().startsWith("{")) {
        return;
      }

      let message: XiaozhiJsonMessage;
      try {
        message = JSON.parse(payload) as XiaozhiJsonMessage;
      } catch {
        return;
      }

      if (message.type === "hello") {
        sessionReady = true;
        sendTextMessage();
        return;
      }

      if (message.type === "stt" && message.text?.trim()) {
        return;
      }

      if (message.type === "tts") {
        if (
          (message.state === "start" || message.state === "sentence_start") &&
          message.text?.trim()
        ) {
          responseParts.push(message.text.trim());
        }
        if (message.state === "stop" || message.state === "end") {
          finish(() => {
            const reply = responseParts.join("").trim();
            resolve(reply || "小智已回复，但未返回文本内容。");
          });
        }
        return;
      }

      if (message.type === "llm" && message.text?.trim()) {
        responseParts.push(message.text.trim());
      }
    });

    ws.on("error", (error: Error) => {
      finish(() => {
        reject(
          new XiaozhiChatError(
            error instanceof Error ? error.message : "小智连接异常",
            "connect_failed",
          ),
        );
      });
    });

    ws.on("close", () => {
      if (!finished && sessionReady) {
        finish(() => {
          const reply = responseParts.join("").trim();
          if (reply) {
            resolve(reply);
            return;
          }
          reject(new XiaozhiChatError("连接已断开，未收到完整回复", "protocol_error"));
        });
      } else if (!finished) {
        finish(() => {
          reject(new XiaozhiChatError("无法连接小智服务", "connect_failed"));
        });
      }
    });
  });
}

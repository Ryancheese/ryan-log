/**
 * 浏览器 WebSocket 无法设置 Device-Id 等头，用本代理转发到小智服务。
 * 启动: npm run xiaozhi:proxy
 */
import { randomUUID } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { WebSocket, WebSocketServer } from "ws";
import { loadEnvLocal } from "./load-env-local.mjs";

loadEnvLocal();

const DEVICE_FILE = resolve(process.cwd(), ".xiaozhi-device.json");

function loadDeviceFile() {
  if (!existsSync(DEVICE_FILE)) {
    return null;
  }
  try {
    return JSON.parse(readFileSync(DEVICE_FILE, "utf8"));
  } catch {
    return null;
  }
}

const saved = loadDeviceFile();
const TARGET =
  process.env.XIAOZHI_WS_URL || saved?.websocketUrl || "ws://127.0.0.1:8000/xiaozhi/v1/";
const PORT = Number(process.env.XIAOZHI_WS_PROXY_PORT || 8787);
const DEVICE_ID = process.env.XIAOZHI_DEVICE_ID || saved?.deviceId || "ryan-log-web";
const CLIENT_ID = process.env.XIAOZHI_CLIENT_ID || saved?.clientId || randomUUID();
const DEVICE_TOKEN =
  process.env.XIAOZHI_DEVICE_TOKEN?.trim() || saved?.deviceToken?.trim() || "";
const PROTOCOL_VERSION = process.env.XIAOZHI_PROTOCOL_VERSION || "3";
const isCloud = TARGET.startsWith("wss://");

const wss = new WebSocketServer({ host: "127.0.0.1", port: PORT });

wss.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.log(`[xiaozhi-proxy] 端口 ${PORT} 已被占用，代理很可能已在运行。`);
    console.log(`[xiaozhi-proxy] 博客可直接使用 ws://127.0.0.1:${PORT}，无需重复启动。`);
    console.log(`[xiaozhi-proxy] 若刚改过 .env.local 需重启代理：`);
    console.log(`  kill $(lsof -t -i:${PORT}) && npm run xiaozhi:proxy`);
    process.exit(0);
  }
  console.error("[xiaozhi-proxy] 启动失败:", error.message);
  process.exit(1);
});

wss.on("listening", () => {
  console.log(`[xiaozhi-proxy] ws://127.0.0.1:${PORT} -> ${TARGET}`);
  console.log(`[xiaozhi-proxy] mode=${isCloud ? "cloud" : "local"} device=${DEVICE_ID}`);
});

wss.on("connection", (client) => {
  const headers = {
    "Device-Id": DEVICE_ID,
    "Client-Id": CLIENT_ID,
    "Protocol-Version": PROTOCOL_VERSION,
  };
  if (DEVICE_TOKEN) {
    headers.Authorization = `Bearer ${DEVICE_TOKEN}`;
  }

  const server = new WebSocket(TARGET, { headers });
  const pendingFromClient = [];
  let upstreamReady = false;

  const closeBoth = () => {
    try {
      client.close();
    } catch {
      /* ignore */
    }
    try {
      server.close();
    } catch {
      /* ignore */
    }
  };

  const flushPending = () => {
    for (const item of pendingFromClient) {
      server.send(item.data, { binary: item.isBinary });
    }
    pendingFromClient.length = 0;
  };

  client.on("message", (data, isBinary) => {
    if (upstreamReady && server.readyState === WebSocket.OPEN) {
      server.send(data, { binary: isBinary });
      return;
    }
    pendingFromClient.push({ data, isBinary });
  });

  client.on("close", closeBoth);
  client.on("error", closeBoth);

  server.on("open", () => {
    upstreamReady = true;
    flushPending();
  });

  server.on("message", (data, isBinary) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data, { binary: isBinary });
    }
  });

  server.on("close", (code, reason) => {
    if (!upstreamReady) {
      console.error(
        `[xiaozhi-proxy] upstream closed before ready (${code})`,
        reason?.toString() || "",
      );
    }
    closeBoth();
  });

  server.on("error", (error) => {
    console.error("[xiaozhi-proxy] upstream error:", error.message);
    closeBoth();
  });
});

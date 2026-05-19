/**
 * 维持与小智云端 MCP 接入点的长连接，控制台才会显示「已连接」。
 * 用法: npm run xiaozhi:mcp:bridge
 */
import { WebSocket } from "ws";
import { loadEnvLocal } from "./load-env-local.mjs";

loadEnvLocal();

const endpoint = process.env.XIAOZHI_MCP_ENDPOINT?.trim();
if (!endpoint) {
  console.error("请在 .env.local 设置 XIAOZHI_MCP_ENDPOINT");
  process.exit(1);
}

let ws;
let reconnectTimer;

function reply(id, result) {
  ws.send(JSON.stringify({ jsonrpc: "2.0", id, result }));
}

function connect() {
  console.log("[mcp-bridge] 连接中…");
  ws = new WebSocket(endpoint);

  ws.on("open", () => {
    console.log("[mcp-bridge] 已连接，等待云端握手…");
  });

  ws.on("message", (data) => {
    const text = Buffer.isBuffer(data) ? data.toString("utf8") : String(data);
    let msg;
    try {
      msg = JSON.parse(text);
    } catch {
      return;
    }

    if (msg.method === "initialize" && msg.id !== undefined) {
      reply(msg.id, {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: { name: "ryan-log-bridge", version: "1.0.0" },
      });
      ws.send(JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }));
      console.log("[mcp-bridge] 握手完成 → 请在控制台点「刷新」");
      return;
    }

    if (msg.method === "tools/list" && msg.id !== undefined) {
      reply(msg.id, { tools: [] });
      return;
    }

    if (msg.method === "ping" && msg.id !== undefined) {
      reply(msg.id, {});
    }
  });

  ws.on("close", (code) => {
    console.log(`[mcp-bridge] 断开 (${code})，5 秒后重连…`);
    scheduleReconnect();
  });

  ws.on("error", (error) => {
    console.error("[mcp-bridge] 错误:", error.message);
  });
}

function scheduleReconnect() {
  if (reconnectTimer) {
    return;
  }
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connect();
  }, 5000);
}

process.on("SIGINT", () => {
  console.log("\n[mcp-bridge] 退出");
  ws?.close();
  process.exit(0);
});

connect();

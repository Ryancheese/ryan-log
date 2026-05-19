/**
 * 检测小智云端 MCP 接入点是否可连。
 * 用法: npm run xiaozhi:mcp:ping
 */
import { WebSocket } from "ws";
import { loadEnvLocal } from "./load-env-local.mjs";

loadEnvLocal();

const endpoint = process.env.XIAOZHI_MCP_ENDPOINT?.trim();
if (!endpoint) {
  console.error("请在 .env.local 设置 XIAOZHI_MCP_ENDPOINT");
  process.exit(1);
}

const ws = new WebSocket(endpoint);
const timeout = setTimeout(() => {
  console.error("连接超时（15s）");
  ws.terminate();
  process.exit(1);
}, 15000);

ws.on("open", () => {
  clearTimeout(timeout);
  console.log("MCP 接入点连接成功");
  console.log("可在控制台刷新 MCP 状态，或运行外部 MCP 工具：");
  console.log("  export MCP_ENDPOINT='$XIAOZHI_MCP_ENDPOINT'");
  console.log("  # 例: python mcp_pipe.py calculator.py");
  ws.close();
  process.exit(0);
});

ws.on("message", (data) => {
  const text = Buffer.isBuffer(data) ? data.toString("utf8") : String(data);
  console.log("收到:", text.slice(0, 200));
});

ws.on("error", (error) => {
  clearTimeout(timeout);
  console.error("连接失败:", error.message);
  process.exit(1);
});

ws.on("close", (code, reason) => {
  if (code !== 1000 && code !== 1005) {
    console.log("关闭:", code, reason?.toString() || "");
  }
});

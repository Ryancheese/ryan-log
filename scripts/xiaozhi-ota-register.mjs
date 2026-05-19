/**
 * 向小智云端 OTA 注册「博客 Web 设备」，获取 WebSocket 地址与激活码。
 * 用法: npm run xiaozhi:register
 *
 * 注册后到小智控制台 → 设备管理 → 输入激活码绑定智能体（台湾女友 / 湾湾小何）。
 */
import { randomUUID, createHash } from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { loadEnvLocal } from "./load-env-local.mjs";

loadEnvLocal();

const OTA_URL = process.env.XIAOZHI_OTA_URL || "https://api.tenclass.net/xiaozhi/ota/";
const DEVICE_FILE = resolve(process.cwd(), ".xiaozhi-device.json");

function macFromSeed(seed) {
  const hash = createHash("sha256").update(seed).digest("hex");
  const parts = ["24", "0A", "C4", hash.slice(0, 2), hash.slice(2, 4), hash.slice(4, 6)];
  return parts.join(":").toUpperCase();
}

function loadOrCreateDevice() {
  if (existsSync(DEVICE_FILE)) {
    return JSON.parse(readFileSync(DEVICE_FILE, "utf8"));
  }
  const seed = process.env.XIAOZHI_DEVICE_SEED || "ryan-log-web";
  return {
    deviceId: macFromSeed(seed),
    clientId: randomUUID(),
  };
}

async function register() {
  const device = loadOrCreateDevice();
  const body = {
    application: { name: "ryan-log", version: "1.0.0" },
    board: { type: "web" },
  };

  const response = await fetch(OTA_URL, {
    method: "POST",
    headers: {
      "Device-Id": device.deviceId,
      "Client-Id": device.clientId,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  if (!response.ok) {
    console.error("OTA 失败:", data);
    process.exit(1);
  }

  const saved = {
    ...device,
    otaUrl: OTA_URL,
    websocketUrl: data.websocket?.url || "wss://api.tenclass.net/xiaozhi/v1/",
    deviceToken: data.websocket?.token || "",
    registeredAt: new Date().toISOString(),
    activation: data.activation || null,
  };

  writeFileSync(DEVICE_FILE, `${JSON.stringify(saved, null, 2)}\n`, "utf8");

  console.log("\n=== 小智云端设备注册 ===\n");
  console.log("设备 ID (Device-Id):", saved.deviceId);
  console.log("客户端 ID (Client-Id):", saved.clientId);
  console.log("WebSocket:", saved.websocketUrl);
  console.log("Token:", saved.deviceToken || "(空)");
  console.log("\n配置已写入:", DEVICE_FILE);

  if (saved.activation?.code) {
    console.log("\n【请在控制台添加设备】");
    console.log("打开 https://xiaozhi.me 控制台 → 设备管理 → 添加设备");
    console.log("激活码:", saved.activation.code);
    console.log(saved.activation.message || "");
    console.log("\n绑定智能体后，在 .env.local 设置：");
    console.log(`XIAOZHI_WS_URL=${saved.websocketUrl}`);
    console.log(`XIAOZHI_DEVICE_TOKEN=${saved.deviceToken}`);
    console.log(`XIAOZHI_DEVICE_ID=${saved.deviceId}`);
    console.log(`XIAOZHI_CLIENT_ID=${saved.clientId}`);
  } else {
    console.log("\n设备已注册（无新激活码）。重启代理后即可连接云端智能体。");
  }

  console.log("\n然后: npm run xiaozhi:proxy && npm run dev\n");
}

register().catch((error) => {
  console.error(error);
  process.exit(1);
});

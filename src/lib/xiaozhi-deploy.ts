/** 判断是否走服务端 API（Vercel / 外网），而非浏览器连本地 WebSocket 代理 */
export function shouldUseServerChat() {
  if (process.env.NEXT_PUBLIC_XIAOZHI_USE_SERVER_CHAT === "true") {
    return true;
  }
  const proxyUrl = process.env.NEXT_PUBLIC_XIAOZHI_WS_PROXY_URL?.trim() ?? "";
  if (!proxyUrl) {
    return true;
  }
  return /localhost|127\.0\.0\.1/i.test(proxyUrl);
}

export function getXiaozhiVoiceMode(): "browser" | "opus" {
  return shouldUseServerChat() ? "browser" : "opus";
}

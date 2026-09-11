import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["ws", "bufferutil", "utf-8-validate"],
  // Hide the Next.js "N" badge in local preview so it doesn't look like a broken FAB.
  devIndicators: false,
};

export default nextConfig;

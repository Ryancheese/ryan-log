import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ryan Log｜极简技术博客",
    short_name: "Ryan Log",
    description: "记录前端工程、产品思考与技术实践的极简技术博客。",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    lang: "zh-CN",
  };
}

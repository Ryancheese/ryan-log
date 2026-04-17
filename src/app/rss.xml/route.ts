import { getAllPosts } from "@/lib/posts";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ryan-log.vercel.app";
  const posts = getAllPosts();

  const rssItems = posts
    .map(
      (post) => `
      <item>
        <title><![CDATA[${post.title}]]></title>
        <description><![CDATA[${post.summary}]]></description>
        <link>${baseUrl}/blog/${post.slug}</link>
        <guid>${baseUrl}/blog/${post.slug}</guid>
        <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      </item>`,
    )
    .join("");

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0">
    <channel>
      <title>Ryan Log｜极简技术博客</title>
      <link>${baseUrl}</link>
      <description>记录前端工程、产品思考与技术实践的极简技术博客。</description>
      <language>zh-cn</language>
      ${rssItems}
    </channel>
  </rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}

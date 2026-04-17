import type { Metadata } from "next";
import { PostCard } from "@/components/post-card";
import { getAllPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "博客",
  description: "浏览全部技术文章与实践记录。",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="container-page py-16 md:py-20">
      <section className="mb-10">
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">文章目录</p>
        <h1 className="mt-3 text-4xl font-bold text-zinc-100">全部文章</h1>
        <p className="mt-3 max-w-2xl text-zinc-400">
          当前共 {posts.length} 篇文章，覆盖前端开发、工程实践与学习复盘。
        </p>
      </section>
      <section className="grid gap-5">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </section>
    </div>
  );
}

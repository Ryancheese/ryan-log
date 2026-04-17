import Link from "next/link";
import { PostCard } from "@/components/post-card";
import { getAllPosts } from "@/lib/posts";

export default function Home() {
  const latestPosts = getAllPosts().slice(0, 3);

  return (
    <div className="container-page py-16 md:py-24">
      <section className="fade-up rounded-3xl border border-zinc-800 bg-zinc-900/50 px-8 py-14 md:px-12">
        <p className="mb-4 text-xs uppercase tracking-[0.22em] text-zinc-500">
          Frontend Engineer · Builder
        </p>
        <h1 className="max-w-3xl text-3xl font-bold leading-tight text-zinc-100 md:text-5xl">
          用极简方式记录技术成长，
          <span className="text-sky-300"> 构建可复用的前端工程经验。</span>
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-400 md:text-lg">
          这里是我的个人博客，聚焦 Next.js、TypeScript、工程化与产品实践。
          我会持续分享可以直接应用到项目中的方案与思考。
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/blog"
            className="rounded-full border border-sky-300 bg-sky-300 px-6 py-2.5 text-sm font-semibold text-zinc-900 transition hover:bg-sky-200"
          >
            阅读最新文章
          </Link>
          <a
            href="mailto:ryan@example.com"
            className="rounded-full border border-zinc-700 px-6 py-2.5 text-sm font-semibold text-zinc-200 transition hover:border-zinc-500"
          >
            联系我
          </a>
        </div>
      </section>

      <section className="mt-14">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-semibold text-zinc-100">精选文章</h2>
          <Link href="/blog" className="text-sm text-zinc-400 hover:text-sky-300">
            查看全部 →
          </Link>
        </div>
        <div className="grid gap-5">
          {latestPosts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </section>
    </div>
  );
}

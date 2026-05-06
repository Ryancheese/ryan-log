import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { LocalizedPostMeta } from "@/lib/posts";

type PostCardProps = {
  post: LocalizedPostMeta;
  locale: Locale;
};

export function PostCard({ post, locale }: PostCardProps) {
  return (
    <article className="group rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 transition duration-200 hover:-translate-y-1 hover:border-zinc-700 hover:bg-zinc-900/70">
      <p className="mb-3 text-xs uppercase tracking-[0.16em] text-zinc-500">
        {post.dateText} · {post.readingTime}
      </p>
      <h2 className="text-xl font-semibold text-zinc-100 transition group-hover:text-sky-300">
        <Link href={`/${locale}/blog/${post.slug}`}>{post.localizedTitle}</Link>
      </h2>
      <p className="mt-4 text-sm leading-7 text-zinc-400">{post.localizedSummary}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-zinc-700 px-2.5 py-1 text-xs text-zinc-300"
          >
            #{tag}
          </span>
        ))}
      </div>
    </article>
  );
}

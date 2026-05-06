import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { isSupportedLocale, type Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { getLocalizedPostBySlug } from "@/lib/posts";

type LocaleBlogPostPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: LocaleBlogPostPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isSupportedLocale(locale)) {
    return {};
  }

  const post = await getLocalizedPostBySlug(slug, locale as Locale);
  if (!post) {
    return {};
  }

  return {
    title: post.localizedTitle,
    description: post.localizedSummary,
    openGraph: {
      title: post.localizedTitle,
      description: post.localizedSummary,
      type: "article",
      publishedTime: post.date,
      url: `/${locale}/blog/${post.slug}`,
      images: [{ url: post.cover || "/og-image.svg", width: 1200, height: 630 }],
    },
  };
}

function extractHeadings(content: string) {
  return content
    .split("\n")
    .filter((line) => line.startsWith("## "))
    .map((line) => {
      const text = line.replace(/^##\s+/, "").trim();
      const id = text
        .toLowerCase()
        .replace(/[^\u4e00-\u9fa5\w\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
      return { text, id };
    });
}

export default async function LocaleBlogPostPage({ params }: LocaleBlogPostPageProps) {
  const { locale, slug } = await params;
  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const activeLocale = locale as Locale;
  const messages = getMessages(activeLocale);
  const post = await getLocalizedPostBySlug(slug, activeLocale);
  if (!post) {
    notFound();
  }

  const headings = extractHeadings(post.localizedContent);

  return (
    <div className="container-page py-14 md:py-20">
      <Link
        href={`/${activeLocale}/blog`}
        className="text-sm text-zinc-400 transition hover:text-sky-300"
      >
        ← {messages.backToPosts}
      </Link>
      <article className="mt-6 grid gap-12 lg:grid-cols-[1fr_220px]">
        <div className="min-w-0 w-full max-w-prose">
          <header className="border-b border-zinc-800 pb-8">
            <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
              {post.dateText} · {post.readingTime}
            </p>
            <h1 className="mt-4 text-3xl font-bold leading-tight text-zinc-100 md:text-4xl">
              {post.localizedTitle}
            </h1>
            <p className="mt-4 text-zinc-400">{post.localizedSummary}</p>
          </header>
          <div className="prose-blog mt-10">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug, rehypeHighlight]}>
              {post.localizedContent}
            </ReactMarkdown>
          </div>
        </div>
        {headings.length > 0 ? (
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">{messages.toc}</p>
              <ul className="mt-4 space-y-3 text-sm text-zinc-400">
                {headings.map((heading) => (
                  <li key={heading.id}>
                    <a href={`#${heading.id}`} className="transition hover:text-sky-300">
                      {heading.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        ) : null}
      </article>
    </div>
  );
}

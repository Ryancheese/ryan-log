import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostCard } from "@/components/post-card";
import { isSupportedLocale, type Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { getAllLocalizedPosts } from "@/lib/posts";

type LocaleBlogPageProps = {
  params: Promise<{ locale: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: LocaleBlogPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) {
    return {};
  }

  const messages = getMessages(locale as Locale);
  return {
    title: messages.navBlog,
    description: messages.allPostsTitle,
  };
}

export default async function LocaleBlogPage({ params }: LocaleBlogPageProps) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const activeLocale = locale as Locale;
  const messages = getMessages(activeLocale);
  const posts = await getAllLocalizedPosts(activeLocale);

  return (
    <div className="container-page py-16 md:py-20">
      <section className="mb-10">
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{messages.postDirectory}</p>
        <h1 className="mt-3 text-4xl font-bold text-zinc-100">{messages.allPostsTitle}</h1>
        <p className="mt-3 max-w-2xl text-zinc-400">
          {messages.allPostsDesc.replace("{count}", String(posts.length))}
        </p>
      </section>
      <section className="grid gap-5">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} locale={activeLocale} />
        ))}
      </section>
    </div>
  );
}

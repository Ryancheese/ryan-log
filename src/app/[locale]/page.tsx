import Link from "next/link";
import { notFound } from "next/navigation";
import { PostCard } from "@/components/post-card";
import { isSupportedLocale, type Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { getAllLocalizedPosts } from "@/lib/posts";

type LocaleHomeProps = {
  params: Promise<{ locale: string }>;
};

export const dynamic = "force-dynamic";

export default async function LocaleHomePage({ params }: LocaleHomeProps) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const activeLocale = locale as Locale;
  const messages = getMessages(activeLocale);
  const latestPosts = (await getAllLocalizedPosts(activeLocale)).slice(0, 3);

  return (
    <div className="container-page py-16 md:py-24">
      <section className="fade-up rounded-3xl border border-zinc-800 bg-zinc-900/50 px-8 py-14 md:px-12">
        <p className="mb-4 text-xs uppercase tracking-[0.22em] text-zinc-500">{messages.heroBadge}</p>
        <h1 className="max-w-3xl text-3xl font-bold leading-tight text-zinc-100 md:text-5xl">
          {messages.heroTitle}
          <span className="text-sky-300"> {messages.heroHighlight}</span>
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-400 md:text-lg">{messages.heroDesc}</p>
        <p className="mt-4 max-w-2xl text-sm text-zinc-500">
          {messages.heroProfileHintPrefix}
          <Link
            href={`/${activeLocale}/profile`}
            className="mx-1 text-sky-400 underline-offset-4 hover:underline"
          >
            {messages.heroProfileHintLink}
          </Link>
          {messages.heroProfileHintSuffix}
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href={`/${activeLocale}/blog`}
            className="rounded-full border border-sky-300 bg-sky-300 px-6 py-2.5 text-sm font-semibold text-zinc-900 transition hover:bg-sky-200"
          >
            {messages.readLatest}
          </Link>
          <a
            href="mailto:17625416243@163.com"
            className="rounded-full border border-zinc-700 px-6 py-2.5 text-sm font-semibold text-zinc-200 transition hover:border-zinc-500"
          >
            {messages.contactMe}
          </a>
        </div>
      </section>

      <section className="mt-14">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-semibold text-zinc-100">{messages.featuredPosts}</h2>
          <Link href={`/${activeLocale}/blog`} className="text-sm text-zinc-400 hover:text-sky-300">
            {messages.viewAll} →
          </Link>
        </div>
        <div className="grid gap-5">
          {latestPosts.map((post) => (
            <PostCard key={post.slug} post={post} locale={activeLocale} />
          ))}
        </div>
      </section>
    </div>
  );
}

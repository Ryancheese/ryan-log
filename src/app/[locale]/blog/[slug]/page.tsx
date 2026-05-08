import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleContentPanel } from "@/components/article-content-panel";
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

  return (
    <div className="container-page py-14 md:py-20">
      <Link
        href={`/${activeLocale}/blog`}
        className="text-sm text-zinc-400 transition hover:text-sky-300"
      >
        ← {messages.backToPosts}
      </Link>
      <ArticleContentPanel
        locale={activeLocale}
        post={post}
        messages={{
          toc: messages.toc,
          translateArticle: messages.translateArticle,
          translatingArticle: messages.translatingArticle,
          articleTranslated: messages.articleTranslated,
          translateNotNeeded: messages.translateNotNeeded,
          translateFailed: messages.translateFailed,
        }}
      />
    </div>
  );
}

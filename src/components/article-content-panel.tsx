"use client";

import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { DEFAULT_LOCALE, type Locale } from "@/i18n/config";
import type { LocalizedPostData } from "@/lib/posts";

type ArticleContentPanelProps = {
  locale: Locale;
  post: LocalizedPostData;
  messages: {
    toc: string;
    translateArticle: string;
    translatingArticle: string;
    articleTranslated: string;
    translateNotNeeded: string;
    translateFailed: string;
  };
};

type TranslateResponse = {
  title?: string;
  summary?: string;
  content?: string;
};

type CachedTranslation = {
  title: string;
  summary: string;
  content: string;
};

function getCacheKey(slug: string, locale: Locale) {
  return `post-translation:${slug}:${locale}`;
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

export function ArticleContentPanel({ locale, post, messages }: ArticleContentPanelProps) {
  const [title, setTitle] = useState(post.localizedTitle);
  const [summary, setSummary] = useState(post.localizedSummary);
  const [content, setContent] = useState(post.localizedContent);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isTranslated, setIsTranslated] = useState(false);
  const [errorText, setErrorText] = useState("");

  const canTranslate = locale !== DEFAULT_LOCALE;
  const shouldHighlightTranslate = canTranslate && !isTranslated && !isTranslating;
  const headings = useMemo(() => extractHeadings(content), [content]);
  const cacheKey = useMemo(() => getCacheKey(post.slug, locale), [post.slug, locale]);

  useEffect(() => {
    if (!canTranslate) {
      return;
    }
    try {
      const cachedRaw = window.localStorage.getItem(cacheKey);
      if (!cachedRaw) {
        return;
      }
      const cached = JSON.parse(cachedRaw) as CachedTranslation;
      if (!cached.title || !cached.summary || !cached.content) {
        return;
      }
      setTitle(cached.title);
      setSummary(cached.summary);
      setContent(cached.content);
      setIsTranslated(true);
    } catch {
      // Ignore bad cache content and continue with network translation.
    }
  }, [cacheKey, canTranslate]);

  async function onTranslateClick() {
    if (!canTranslate || isTranslating || isTranslated) {
      return;
    }
    setErrorText("");
    setIsTranslating(true);

    try {
      const response = await fetch("/api/translate-post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug: post.slug,
          locale,
        }),
      });

      if (!response.ok) {
        throw new Error("translate_failed");
      }

      const data = (await response.json()) as TranslateResponse;
      setTitle(data.title || post.localizedTitle);
      setSummary(data.summary || post.localizedSummary);
      setContent(data.content || post.localizedContent);
      setIsTranslated(true);
      const toCache: CachedTranslation = {
        title: data.title || post.localizedTitle,
        summary: data.summary || post.localizedSummary,
        content: data.content || post.localizedContent,
      };
      window.localStorage.setItem(cacheKey, JSON.stringify(toCache));
    } catch {
      setErrorText(messages.translateFailed);
    } finally {
      setIsTranslating(false);
    }
  }

  return (
    <article className="mt-6 grid gap-12 lg:grid-cols-[1fr_220px]">
      <div className="min-w-0 w-full max-w-prose">
        <header className="border-b border-zinc-800 pb-8">
          <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
            {post.dateText} · {post.readingTime}
          </p>
          <h1 className="mt-4 text-3xl font-bold leading-tight text-zinc-100 md:text-4xl">{title}</h1>
          <p className="mt-4 text-zinc-400">{summary}</p>
          <div className="mt-5 flex items-center gap-3">
            <button
              type="button"
              onClick={onTranslateClick}
              disabled={!canTranslate || isTranslating || isTranslated}
              className={`article-translate-btn rounded-full border px-4 py-1.5 text-xs uppercase tracking-[0.12em] transition disabled:cursor-not-allowed disabled:opacity-60 ${
                shouldHighlightTranslate
                  ? "article-translate-btn--highlight border-sky-400/80 text-sky-100"
                  : "border-zinc-700 bg-zinc-900/60 text-zinc-200 hover:border-sky-400/60 hover:text-sky-200"
              }`}
            >
              {isTranslating
                ? messages.translatingArticle
                : canTranslate
                  ? isTranslated
                    ? messages.articleTranslated
                    : messages.translateArticle
                  : messages.translateNotNeeded}
            </button>
            {errorText ? <span className="text-xs text-rose-300">{errorText}</span> : null}
          </div>
        </header>
        <div className="prose-blog mt-10">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug, rehypeHighlight]}>
            {content}
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
  );
}

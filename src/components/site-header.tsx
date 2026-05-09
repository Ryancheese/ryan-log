"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, isSupportedLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";

function swapLocale(pathname: string, locale: string) {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 0 && isSupportedLocale(segments[0])) {
    segments[0] = locale;
    return `/${segments.join("/")}`;
  }
  return `/${locale}${pathname === "/" ? "" : pathname}`;
}

export function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const firstSegment = pathname.split("/").filter(Boolean)[0] || DEFAULT_LOCALE;
  const locale = isSupportedLocale(firstSegment) ? firstSegment : DEFAULT_LOCALE;
  const messages = getMessages(locale);
  const navItems = [
    { href: `/${locale}`, label: messages.navHome },
    { href: `/${locale}/blog`, label: messages.navBlog },
  ];

  useEffect(() => {
    for (const item of SUPPORTED_LOCALES) {
      router.prefetch(swapLocale(pathname, item));
    }
    router.prefetch(`/${locale}`);
    router.prefetch(`/${locale}/blog`);
    router.prefetch(`/${locale}/profile`);
  }, [router, pathname, locale]);

  const loadingText =
    locale === "zh"
      ? "语言切换中..."
      : locale === "ja"
        ? "言語を切り替えています..."
        : "Switching language...";

  return (
    <>
      {isPending ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-zinc-950/80 backdrop-blur-md">
          <div className="relative rounded-3xl border border-sky-400/30 bg-zinc-900/80 px-10 py-8 shadow-[0_0_40px_rgba(56,189,248,0.2)]">
            <div className="absolute inset-0 rounded-3xl lang-switch-loader-ring" aria-hidden />
            <div className="absolute inset-0 rounded-3xl lang-switch-loader-scan" aria-hidden />
            <div className="relative flex items-center gap-4">
              <div className="h-10 w-10 rounded-full border-2 border-zinc-700 border-t-sky-300 lang-switch-loader-spin" />
              <p className="text-sm uppercase tracking-[0.2em] text-sky-200">{loadingText}</p>
            </div>
          </div>
        </div>
      ) : null}
      <header className="sticky top-0 z-30 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <Link
            href="/"
            className="text-sm font-semibold tracking-[0.24em] text-zinc-100 transition hover:text-sky-300"
          >
            RYAN.LOG
          </Link>
          <div className="flex flex-1 items-center justify-end gap-4 sm:gap-6">
            <Link
              href={`/${locale}/profile`}
              className="group flex items-center gap-2 rounded-full border border-zinc-800/80 bg-zinc-900/40 py-1 pl-1 pr-3 transition hover:border-sky-500/40 hover:bg-zinc-900/70 sm:gap-3 sm:pr-4"
            >
              <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full ring-2 ring-zinc-700 transition group-hover:ring-sky-500/50">
                <Image
                  src="/avatar.jpg"
                  alt=""
                  width={72}
                  height={72}
                  className="h-full w-full object-cover"
                />
              </span>
              <span className="hidden text-sm text-zinc-400 transition group-hover:text-zinc-100 sm:inline">
                {messages.profile}
              </span>
              <span className="sm:hidden text-xs text-zinc-400 transition group-hover:text-zinc-100">
                {messages.profileShort}
              </span>
            </Link>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              {SUPPORTED_LOCALES.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    if (item === locale) {
                      return;
                    }
                    startTransition(() => {
                      router.push(swapLocale(pathname, item));
                    });
                  }}
                  className={`rounded-full border px-2.5 py-1 uppercase transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    item === locale
                      ? "border-sky-400/70 text-sky-300"
                      : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
                  }`}
                  disabled={isPending}
                >
                  {item}
                </button>
              ))}
            </div>
            <nav className="flex items-center gap-4 text-sm text-zinc-400 sm:gap-6">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className="transition hover:text-zinc-100">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>
    </>
  );
}

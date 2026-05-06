"use client";

import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";

const EMAIL = "17625416243@163.com";
const NETEASE_URL = "https://163cn.tv/5iBOD8u";

type ProfilePanelProps = {
  locale: Locale;
};

export function ProfilePanel({ locale }: ProfilePanelProps) {
  const messages = getMessages(locale);

  return (
    <div className="profile-module group relative w-full max-w-xl px-4">
      <div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 blur-xl transition duration-500 group-hover:opacity-100 motion-reduce:opacity-40"
        style={{
          background:
            "linear-gradient(120deg, rgb(56 189 248 / 0.45), rgb(167 139 250 / 0.35), rgb(34 211 238 / 0.4))",
        }}
        aria-hidden
      />
      <div className="profile-card-border relative rounded-3xl p-[1px]">
        <div className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-zinc-950/90 px-8 py-10 shadow-[0_0_0_1px_rgb(39_39_42_/_0.5)] backdrop-blur-md md:px-12 md:py-12">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.03] motion-reduce:hidden"
            style={{
              backgroundImage:
                "linear-gradient(rgb(255 255 255 / 0.12) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / 0.12) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
            aria-hidden
          />

          <div className="relative flex flex-col items-center gap-8 text-center">
            <div className="profile-avatar-wrap relative">
              <div className="profile-avatar-ring absolute -inset-2 rounded-3xl bg-gradient-to-br from-sky-400/50 via-violet-500/40 to-cyan-400/50 opacity-70 blur-md transition duration-500 group-hover:opacity-100 group-hover:blur-lg motion-reduce:opacity-50 motion-reduce:blur-none" />
              <div className="profile-avatar-scan relative h-36 w-36 overflow-hidden rounded-3xl border border-zinc-700/80 shadow-2xl md:h-44 md:w-44">
                <Image
                  src="/avatar.png"
                  alt={messages.profile}
                  width={352}
                  height={352}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105 motion-reduce:group-hover:scale-100"
                  priority
                />
              </div>
            </div>

            <div className="min-w-0">
              <p className="profile-tagline font-mono text-[10px] uppercase tracking-[0.28em] text-sky-400/90">
                &gt; {messages.profileTag}
              </p>
              <h1 className="profile-glitch-title mt-3 font-heading text-3xl font-bold tracking-tight text-zinc-50 md:text-4xl">
                Ryan
              </h1>
              <p className="mt-2 text-base font-medium text-violet-300/90 md:text-lg">
                {messages.role}
              </p>
              <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-zinc-400">
                {messages.profileDesc}
              </p>

              <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
                <a
                  href={`mailto:${EMAIL}`}
                  className="profile-chip inline-flex items-center justify-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/60 px-5 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-sky-500/50 hover:text-sky-200 hover:shadow-[0_0_20px_rgb(56_189_248_/_0.15)]"
                >
                  <span className="font-mono text-sky-400/80">@</span>
                  {EMAIL}
                </a>
                <a
                  href={NETEASE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="profile-chip inline-flex items-center justify-center gap-2 rounded-full border border-zinc-700 bg-gradient-to-r from-rose-500/15 to-red-600/10 px-5 py-2.5 text-sm font-medium text-rose-100/90 transition hover:border-rose-400/40 hover:shadow-[0_0_24px_rgb(244_63_94_/_0.2)]"
                >
                  <span aria-hidden>♪</span>
                  {messages.netease}
                </a>
              </div>
            </div>
          </div>

          <div
            className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-400/50 to-transparent opacity-0 transition duration-500 group-hover:opacity-100 motion-reduce:opacity-30"
            aria-hidden
          />
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-zinc-600">
        <Link href={`/${locale}`} className="text-zinc-500 transition hover:text-sky-400">
          ← {messages.backHome}
        </Link>
      </p>
    </div>
  );
}

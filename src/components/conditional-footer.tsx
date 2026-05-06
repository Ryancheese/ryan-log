"use client";

import { usePathname } from "next/navigation";
import { DEFAULT_LOCALE, isSupportedLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";

export function ConditionalFooter() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0] || DEFAULT_LOCALE;
  const locale = isSupportedLocale(firstSegment) ? firstSegment : DEFAULT_LOCALE;
  const messages = getMessages(locale);

  if (pathname === `/${locale}/profile`) {
    return null;
  }

  return (
    <footer className="border-t border-zinc-800 py-8 text-center text-sm text-zinc-500">
      <p>
        © {new Date().getFullYear()} Ryan Log. {messages.footer}
      </p>
    </footer>
  );
}

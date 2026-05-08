import { NextResponse } from "next/server";
import { isSupportedLocale, type Locale } from "@/i18n/config";
import { getTranslatedPostBySlug } from "@/lib/posts";

type TranslatePostPayload = {
  slug?: string;
  locale?: string;
};

export async function POST(request: Request) {
  let payload: TranslatePostPayload | null = null;
  try {
    payload = (await request.json()) as TranslatePostPayload;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const slug = payload?.slug?.trim();
  const locale = payload?.locale?.trim();

  if (!slug || !locale || !isSupportedLocale(locale)) {
    return NextResponse.json({ error: "invalid_params" }, { status: 400 });
  }

  const translated = await getTranslatedPostBySlug(slug, locale as Locale);
  if (!translated) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({
    title: translated.localizedTitle,
    summary: translated.localizedSummary,
    content: translated.localizedContent,
  });
}

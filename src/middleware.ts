import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { DEFAULT_LOCALE, isSupportedLocale } from "@/i18n/config";

const LEGACY_SLUG = "/blog/ai通用规则与技能";
const CANONICAL_SLUG = "/blog/ai-rules-and-skills";

export function middleware(request: NextRequest) {
  let pathname = request.nextUrl.pathname;
  try {
    pathname = decodeURIComponent(pathname);
  } catch {
    /* keep raw */
  }

  if (pathname === LEGACY_SLUG) {
    return NextResponse.redirect(new URL(`/${DEFAULT_LOCALE}${CANONICAL_SLUG}`, request.url), 308);
  }

  // public 下的静态资源（如 /avatar.jpg）不能走语言重定向，否则 next/image 优化器会拿到 HTML，报 received null
  if (/\.(?:ico|png|jpg|jpeg|gif|webp|svg|avif|woff2?|ttf|eot)$/i.test(pathname)) {
    return NextResponse.next();
  }

  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];
  if (!firstSegment || !isSupportedLocale(firstSegment)) {
    return NextResponse.redirect(new URL(`/${DEFAULT_LOCALE}${pathname}`, request.url), 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|rss.xml).*)"],
};

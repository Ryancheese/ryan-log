import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

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
    return NextResponse.redirect(new URL(CANONICAL_SLUG, request.url), 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/blog/:path*"],
};

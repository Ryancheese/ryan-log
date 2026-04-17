import type { Metadata } from "next";
import { Noto_Sans_SC, Space_Grotesk } from "next/font/google";
import Script from "next/script";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const headingFont = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
});

const bodyFont = Noto_Sans_SC({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://ryan-log.vercel.app",
  ),
  title: {
    default: "Ryan Log | 极简技术博客",
    template: "%s | Ryan Log",
  },
  description: "记录前端工程、产品思考与技术实践的极简技术博客。",
  keywords: ["前端", "Next.js", "技术博客", "TypeScript", "工程实践"],
  openGraph: {
    title: "Ryan Log | 极简技术博客",
    description: "记录前端工程、产品思考与技术实践的极简技术博客。",
    url: "https://ryan-log.vercel.app",
    siteName: "Ryan Log",
    images: [{ url: "/og-image.svg", width: 1200, height: 630 }],
    locale: "zh_CN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ryan Log | 极简技术博客",
    description: "记录前端工程、产品思考与技术实践的极简技术博客。",
    images: ["/og-image.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

  return (
    <html
      lang="zh-CN"
      className={`${headingFont.variable} ${bodyFont.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans text-zinc-100">
        {plausibleDomain ? (
          <Script
            defer
            data-domain={plausibleDomain}
            src="https://plausible.io/js/script.js"
          />
        ) : null}
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-zinc-800 py-8 text-center text-sm text-zinc-500">
          <p>© {new Date().getFullYear()} Ryan Log. Built with Next.js.</p>
        </footer>
      </body>
    </html>
  );
}

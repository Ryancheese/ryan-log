"use client";

import { usePathname } from "next/navigation";

export function ConditionalFooter() {
  const pathname = usePathname();
  if (pathname === "/profile") {
    return null;
  }

  return (
    <footer className="border-t border-zinc-800 py-8 text-center text-sm text-zinc-500">
      <p>
        © {new Date().getFullYear()} Ryan Log。本站使用 Next.js 构建。
      </p>
    </footer>
  );
}

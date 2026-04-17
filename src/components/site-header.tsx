import Image from "next/image";
import Link from "next/link";

const navItems = [
  { href: "/", label: "首页" },
  { href: "/blog", label: "博客" },
];

export function SiteHeader() {
  return (
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
            href="/profile"
            className="group flex items-center gap-2 rounded-full border border-zinc-800/80 bg-zinc-900/40 py-1 pl-1 pr-3 transition hover:border-sky-500/40 hover:bg-zinc-900/70 sm:gap-3 sm:pr-4"
          >
            <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full ring-2 ring-zinc-700 transition group-hover:ring-sky-500/50">
              <Image
                src="/avatar.png"
                alt=""
                width={72}
                height={72}
                className="h-full w-full object-cover"
              />
            </span>
            <span className="hidden text-sm text-zinc-400 transition group-hover:text-zinc-100 sm:inline">
              个人信息
            </span>
            <span className="sm:hidden text-xs text-zinc-400 transition group-hover:text-zinc-100">
              资料
            </span>
          </Link>
          <nav className="flex items-center gap-4 text-sm text-zinc-400 sm:gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition hover:text-zinc-100"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

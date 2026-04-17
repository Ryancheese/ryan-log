import Link from "next/link";

const navItems = [
  { href: "/", label: "首页" },
  { href: "/blog", label: "博客" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link
          href="/"
          className="text-sm font-semibold tracking-[0.24em] text-zinc-100 transition hover:text-sky-300"
        >
          RYAN.LOG
        </Link>
        <nav className="flex items-center gap-6 text-sm text-zinc-400">
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
    </header>
  );
}

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">404</p>
      <h1 className="mt-4 text-3xl font-bold text-zinc-100">页面不存在</h1>
      <p className="mt-4 max-w-md text-zinc-400">
        你访问的页面可能已经被移动或删除。返回博客首页继续浏览内容。
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full border border-zinc-700 px-6 py-2.5 text-sm text-zinc-200 transition hover:border-zinc-500"
      >
        返回首页
      </Link>
    </div>
  );
}

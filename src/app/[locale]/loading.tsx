export default function LocaleLoading() {
  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center bg-zinc-950/80 backdrop-blur-md">
      <div className="relative rounded-3xl border border-sky-400/30 bg-zinc-900/80 px-10 py-8 shadow-[0_0_40px_rgba(56,189,248,0.2)]">
        <div className="absolute inset-0 rounded-3xl lang-switch-loader-ring" aria-hidden />
        <div className="absolute inset-0 rounded-3xl lang-switch-loader-scan" aria-hidden />
        <div className="relative flex items-center gap-4">
          <div className="h-10 w-10 rounded-full border-2 border-zinc-700 border-t-sky-300 lang-switch-loader-spin" />
          <p className="text-sm uppercase tracking-[0.2em] text-sky-200">Loading...</p>
        </div>
      </div>
    </div>
  );
}

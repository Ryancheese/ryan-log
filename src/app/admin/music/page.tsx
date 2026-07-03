"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";

type BackgroundMusicConfig = {
  enabled: boolean;
  url: string | null;
  title: string;
  volume: number;
  loop: boolean;
};

const SECRET_STORAGE_KEY = "bgm-admin-secret";

export default function AdminMusicPage() {
  const [secret, setSecret] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [config, setConfig] = useState<BackgroundMusicConfig | null>(null);
  const [title, setTitle] = useState("");
  const [volume, setVolume] = useState(0.35);
  const [enabled, setEnabled] = useState(false);
  const [loop, setLoop] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const authHeaders = useCallback(
    () => ({
      Authorization: `Bearer ${secret}`,
    }),
    [secret],
  );

  const loadConfig = useCallback(async () => {
    const response = await fetch("/api/background-music", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("加载配置失败");
    }
    const data = (await response.json()) as BackgroundMusicConfig;
    setConfig(data);
    setTitle(data.title);
    setVolume(data.volume);
    setEnabled(data.enabled);
    setLoop(data.loop);
  }, []);

  useEffect(() => {
    const stored = sessionStorage.getItem(SECRET_STORAGE_KEY);
    if (stored) {
      setSecret(stored);
      setAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (!authenticated) {
      return;
    }
    void loadConfig().catch(() => setError("无法加载背景音乐配置"));
  }, [authenticated, loadConfig]);

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");

    const response = await fetch("/api/background-music", {
      method: "PUT",
      headers: {
        ...authHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    if (response.status === 401) {
      setError("管理密钥不正确，请检查 BGM_ADMIN_SECRET 环境变量");
      return;
    }

    if (!response.ok) {
      setError("验证失败，请稍后重试");
      return;
    }

    sessionStorage.setItem(SECRET_STORAGE_KEY, secret);
    setAuthenticated(true);
    const data = (await response.json()) as BackgroundMusicConfig;
    setConfig(data);
    setMessage("验证成功，可以管理背景音乐");
  }

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      setError("请选择音频文件");
      return;
    }

    setUploading(true);
    try {
      const uploadData = new FormData();
      uploadData.append("file", file);

      const response = await fetch("/api/background-music/upload", {
        method: "POST",
        headers: authHeaders(),
        body: uploadData,
      });

      const data = (await response.json()) as BackgroundMusicConfig & { error?: string };

      if (!response.ok) {
        setError(data.error || "上传失败");
        return;
      }

      setConfig(data);
      setTitle(data.title);
      setEnabled(data.enabled);
      setMessage(`上传成功：${data.title || "背景音乐"}`);
      form.reset();
    } catch {
      setError("上传失败，请稍后重试");
    } finally {
      setUploading(false);
    }
  }

  async function handleSaveSettings(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    try {
      const response = await fetch("/api/background-music", {
        method: "PUT",
        headers: {
          ...authHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ enabled, title, volume, loop }),
      });

      const data = (await response.json()) as BackgroundMusicConfig & { error?: string };

      if (!response.ok) {
        setError(data.error || "保存失败");
        return;
      }

      setConfig(data);
      setMessage("设置已保存");
    } catch {
      setError("保存失败，请稍后重试");
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    sessionStorage.removeItem(SECRET_STORAGE_KEY);
    setAuthenticated(false);
    setSecret("");
    setMessage("");
    setError("");
  }

  return (
    <div className="container-page py-12 md:py-16">
      <div className="mx-auto max-w-xl">
        <div className="mb-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-sky-400/90">
            &gt; BGM Admin
          </p>
          <h1 className="mt-2 font-heading text-3xl font-bold text-zinc-50">背景音乐管理</h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            上传音频文件并控制全站背景音乐。支持 MP3、OGG、WAV、WebM、M4A，最大 15MB。
          </p>
        </div>

        {!authenticated ? (
          <form
            onSubmit={(event) => void handleLogin(event)}
            className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6"
          >
            <label className="block text-sm text-zinc-300" htmlFor="secret">
              管理密钥
            </label>
            <input
              id="secret"
              type="password"
              value={secret}
              onChange={(event) => setSecret(event.target.value)}
              placeholder="与 BGM_ADMIN_SECRET 环境变量一致"
              className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 outline-none transition focus:border-sky-500/60"
              required
            />
            <button
              type="submit"
              className="mt-4 w-full rounded-full border border-sky-500/40 bg-sky-500/10 px-5 py-2.5 text-sm font-medium text-sky-200 transition hover:bg-sky-500/20"
            >
              进入管理
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            <section className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6">
              <h2 className="text-lg font-semibold text-zinc-100">上传音乐</h2>
              <form className="mt-4 space-y-4" onSubmit={(event) => void handleUpload(event)}>
                <input
                  name="file"
                  type="file"
                  accept="audio/mpeg,audio/mp3,audio/ogg,audio/wav,audio/webm,audio/aac,audio/mp4,audio/x-m4a,.mp3,.ogg,.wav,.webm,.m4a,.aac"
                  className="block w-full text-sm text-zinc-400 file:mr-4 file:rounded-full file:border-0 file:bg-zinc-800 file:px-4 file:py-2 file:text-sm file:text-zinc-200 hover:file:bg-zinc-700"
                  required
                />
                <button
                  type="submit"
                  disabled={uploading}
                  className="rounded-full border border-violet-500/40 bg-violet-500/10 px-5 py-2.5 text-sm font-medium text-violet-200 transition hover:bg-violet-500/20 disabled:opacity-60"
                >
                  {uploading ? "上传中..." : "上传并启用"}
                </button>
              </form>
              {config?.url ? (
                <p className="mt-4 break-all text-xs text-zinc-500">
                  当前文件：<span className="text-zinc-400">{config.url}</span>
                </p>
              ) : (
                <p className="mt-4 text-xs text-zinc-500">尚未上传背景音乐</p>
              )}
            </section>

            <section className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6">
              <h2 className="text-lg font-semibold text-zinc-100">播放设置</h2>
              <form className="mt-4 space-y-4" onSubmit={(event) => void handleSaveSettings(event)}>
                <label className="flex items-center gap-3 text-sm text-zinc-300">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(event) => setEnabled(event.target.checked)}
                    className="h-4 w-4 rounded border-zinc-600 bg-zinc-900"
                  />
                  启用全站背景音乐
                </label>

                <div>
                  <label className="block text-sm text-zinc-300" htmlFor="title">
                    显示标题
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="例如：Lo-fi 氛围"
                    className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 outline-none transition focus:border-sky-500/60"
                  />
                </div>

                <div>
                  <label className="block text-sm text-zinc-300" htmlFor="volume">
                    默认音量：{Math.round(volume * 100)}%
                  </label>
                  <input
                    id="volume"
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={volume}
                    onChange={(event) => setVolume(Number(event.target.value))}
                    className="mt-2 w-full accent-sky-400"
                  />
                </div>

                <label className="flex items-center gap-3 text-sm text-zinc-300">
                  <input
                    type="checkbox"
                    checked={loop}
                    onChange={(event) => setLoop(event.target.checked)}
                    className="h-4 w-4 rounded border-zinc-600 bg-zinc-900"
                  />
                  循环播放
                </label>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full border border-sky-500/40 bg-sky-500/10 px-5 py-2.5 text-sm font-medium text-sky-200 transition hover:bg-sky-500/20 disabled:opacity-60"
                >
                  {saving ? "保存中..." : "保存设置"}
                </button>
              </form>
            </section>

            <div className="flex items-center justify-between text-sm">
              <Link href="/zh" className="text-zinc-500 transition hover:text-sky-400">
                ← 返回首页
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="text-zinc-500 transition hover:text-rose-300"
              >
                退出管理
              </button>
            </div>
          </div>
        )}

        {message ? <p className="mt-6 text-sm text-emerald-400">{message}</p> : null}
        {error ? <p className="mt-6 text-sm text-rose-400">{error}</p> : null}

        <p className="mt-8 text-xs leading-relaxed text-zinc-600">
          本地开发：文件保存在 <code className="text-zinc-500">public/music/</code>。
          Vercel 部署：请在项目设置中启用 Blob 存储并配置{" "}
          <code className="text-zinc-500">BLOB_READ_WRITE_TOKEN</code>，否则上传无法持久化。
        </p>
      </div>
    </div>
  );
}

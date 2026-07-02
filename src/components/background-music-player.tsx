"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { DEFAULT_LOCALE, isSupportedLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";

type BackgroundMusicConfig = {
  enabled: boolean;
  url: string | null;
  title: string;
  volume: number;
  loop: boolean;
};

const STORAGE_KEY = "bgm-user-muted";

export function BackgroundMusicPlayer() {
  const pathname = usePathname();
  const firstSegment = pathname.split("/").filter(Boolean)[0] || DEFAULT_LOCALE;
  const locale = isSupportedLocale(firstSegment) ? firstSegment : DEFAULT_LOCALE;
  const messages = getMessages(locale);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [config, setConfig] = useState<BackgroundMusicConfig | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadConfig() {
      try {
        const response = await fetch("/api/background-music", { cache: "no-store" });
        if (!response.ok) {
          return;
        }
        const data = (await response.json()) as BackgroundMusicConfig;
        if (!cancelled) {
          setConfig(data);
        }
      } catch {
        /* ignore */
      }
    }

    void loadConfig();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "false") {
      setMuted(false);
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !config?.url) {
      return;
    }

    audio.volume = config.volume;
    audio.loop = config.loop;
    audio.muted = muted;

    if (!muted && config.enabled) {
      void audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    } else {
      audio.pause();
      setPlaying(false);
    }
  }, [config, muted]);

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !config?.url) {
      return;
    }

    if (muted) {
      setMuted(false);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, "false");
      }
      try {
        await audio.play();
        setPlaying(true);
      } catch {
        setPlaying(false);
      }
      return;
    }

    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }

    try {
      await audio.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  }, [config?.url, muted, playing]);

  const toggleMute = useCallback(() => {
    const next = !muted;
    setMuted(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, String(next));
    }
    if (next) {
      audioRef.current?.pause();
      setPlaying(false);
    }
  }, [muted]);

  if (!config?.enabled || !config.url) {
    return null;
  }

  return (
    <div className="bgm-player-root">
      {expanded ? (
        <div className="bgm-player-panel">
          <p className="bgm-player-title">{config.title || messages.bgmDefaultTitle}</p>
          <div className="bgm-player-controls">
            <button
              type="button"
              className="bgm-player-btn"
              onClick={() => void togglePlay()}
              aria-label={playing ? messages.bgmPause : messages.bgmPlay}
            >
              {playing ? "⏸" : "▶"}
            </button>
            <button
              type="button"
              className={`bgm-player-btn ${muted ? "is-muted" : ""}`}
              onClick={toggleMute}
              aria-label={muted ? messages.bgmUnmute : messages.bgmMute}
            >
              {muted ? "🔇" : "🔊"}
            </button>
            <button
              type="button"
              className="bgm-player-btn"
              onClick={() => setExpanded(false)}
              aria-label={messages.bgmCollapse}
            >
              ›
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className={`bgm-player-fab ${playing ? "is-playing" : ""}`}
          onClick={() => setExpanded(true)}
          aria-label={messages.bgmOpen}
        >
          <span className="bgm-player-fab-glow" aria-hidden />
          <span className="bgm-player-fab-icon" aria-hidden>
            ♪
          </span>
        </button>
      )}

      <audio
        ref={audioRef}
        src={config.url}
        preload="metadata"
        playsInline
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
    </div>
  );
}

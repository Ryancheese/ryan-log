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

const MUTE_KEY = "bgm-user-muted";

export function BackgroundMusicPlayer() {
  const pathname = usePathname();
  const firstSegment = pathname.split("/").filter(Boolean)[0] || DEFAULT_LOCALE;
  const locale = isSupportedLocale(firstSegment) ? firstSegment : DEFAULT_LOCALE;
  const messages = getMessages(locale);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [config, setConfig] = useState<BackgroundMusicConfig | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const prefsReady = useRef(false);

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
    const stored = window.localStorage.getItem(MUTE_KEY);
    setMuted(stored !== "false");
    prefsReady.current = true;
  }, []);

  const syncAndPlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !config?.url || !config.enabled) {
      return false;
    }
    audio.volume = config.volume;
    audio.loop = config.loop;
    audio.muted = muted;
    try {
      await audio.play();
      setPlaying(true);
      return true;
    } catch {
      setPlaying(false);
      return false;
    }
  }, [config, muted]);

  useEffect(() => {
    if (!prefsReady.current || !config?.enabled || !config.url) {
      return;
    }

    let cancelled = false;
    const onGesture = () => {
      if (!cancelled) {
        void syncAndPlay();
      }
    };

    void syncAndPlay().then((ok) => {
      if (cancelled || ok) {
        return;
      }
      document.addEventListener("pointerdown", onGesture, { once: true });
      document.addEventListener("keydown", onGesture, { once: true });
    });

    return () => {
      cancelled = true;
      document.removeEventListener("pointerdown", onGesture);
      document.removeEventListener("keydown", onGesture);
    };
  }, [config, muted, syncAndPlay]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    audio.muted = muted;
    if (config?.volume != null) {
      audio.volume = config.volume;
    }
  }, [muted, config?.volume]);

  // Click outside -> collapse to circle
  useEffect(() => {
    if (!expanded) {
      return;
    }
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setExpanded(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [expanded]);

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !config?.url) {
      return;
    }
    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }
    await syncAndPlay();
  }, [config?.url, playing, syncAndPlay]);

  const toggleMute = useCallback(() => {
    const next = !muted;
    setMuted(next);
    window.localStorage.setItem(MUTE_KEY, String(next));
    const audio = audioRef.current;
    if (audio) {
      audio.muted = next;
    }
    if (!next) {
      void syncAndPlay();
    }
  }, [muted, syncAndPlay]);

  if (!config?.enabled || !config.url) {
    return null;
  }

  return (
    <div ref={rootRef} className="bgm-player-root">
      {expanded ? (
        <div className="bgm-player-panel">
          <p className="bgm-player-title">{config.title || messages.bgmDefaultTitle}</p>
          <div className="bgm-player-controls">
            <button
              type="button"
              className="bgm-player-btn"
              onClick={() => void togglePlay()}
              aria-label={playing ? messages.bgmPause : messages.bgmPlay}
              title={playing ? messages.bgmPause : messages.bgmPlay}
            >
              {playing ? "⏸" : "▶"}
            </button>
            <button
              type="button"
              className={`bgm-player-btn ${muted ? "is-muted" : ""}`}
              onClick={toggleMute}
              aria-label={muted ? messages.bgmUnmute : messages.bgmMute}
              title={muted ? messages.bgmUnmute : messages.bgmMute}
            >
              {muted ? "🔇" : "🔊"}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className={`bgm-player-fab ${playing ? "is-playing" : ""} ${muted ? "is-muted" : ""}`}
          onClick={() => setExpanded(true)}
          aria-label={messages.bgmOpen}
          title={messages.bgmOpen}
        >
          <span className="bgm-player-fab-icon" aria-hidden>
            {muted ? "🔇" : "♪"}
          </span>
        </button>
      )}

      <audio
        ref={audioRef}
        src={config.url}
        preload="auto"
        playsInline
        muted={muted}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
    </div>
  );
}

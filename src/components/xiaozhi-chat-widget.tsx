"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { DEFAULT_LOCALE, isSupportedLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { speakWithBrowser } from "@/lib/xiaozhi-speak";
import { getXiaozhiWsSession } from "@/lib/xiaozhi-ws-session";

type ChatRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

type XiaozhiConfig = {
  enabled?: boolean;
  fastEnabled?: boolean;
  xiaozhiEnabled?: boolean;
  useServerChat?: boolean;
  voiceMode?: "browser" | "opus";
};

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function XiaozhiChatWidget() {
  const pathname = usePathname();
  const firstSegment = pathname.split("/").filter(Boolean)[0] || DEFAULT_LOCALE;
  const locale = isSupportedLocale(firstSegment) ? firstSegment : DEFAULT_LOCALE;
  const messages = getMessages(locale);

  const [config, setConfig] = useState<XiaozhiConfig | null>(null);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [errorText, setErrorText] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: messages.xiaozhiWelcome,
    },
  ]);

  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fastEnabled = Boolean(config?.fastEnabled);
  const xiaozhiEnabled = Boolean(config?.xiaozhiEnabled);
  const useServerChat = Boolean(config?.useServerChat);
  const voiceMode = config?.voiceMode ?? "opus";
  const enabled = Boolean(config?.enabled);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/xiaozhi/config")
      .then((res) => res.json())
      .then((data: XiaozhiConfig) => {
        if (!cancelled) {
          setConfig(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setConfig(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    const node = listRef.current;
    if (!node) {
      return;
    }
    node.scrollTop = node.scrollHeight;
  }, [chatMessages, loading, open]);

  function handleToggleOpen() {
    const next = !open;
    setOpen(next);
    if (next && !useServerChat && xiaozhiEnabled) {
      void getXiaozhiWsSession().warmUp().catch(() => {
        /* 本地 Opus 模式预热 */
      });
    }
  }

  async function chatViaServer(text: string): Promise<string> {
    const endpoint =
      fastEnabled || !xiaozhiEnabled ? "/api/xiaozhi/chat-fast" : "/api/xiaozhi/chat";
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });
    const data = (await response.json()) as { reply?: string; message?: string };
    if (!response.ok) {
      throw new Error(data.message || messages.xiaozhiFailed);
    }
    return data.reply || messages.xiaozhiEmptyReply;
  }

  if (!enabled) {
    return null;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = input.trim();
    if (!text || loading) {
      return;
    }

    setErrorText("");
    setInput("");
    setChatMessages((prev) => [...prev, { id: createId(), role: "user", content: text }]);
    setLoading(true);

    const assistantId = createId();
    setChatMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);

    const updateAssistant = (content: string) => {
      setChatMessages((prev) =>
        prev.map((item) => (item.id === assistantId ? { ...item, content } : item)),
      );
    };

    const endLoadingOnFirstText = () => {
      setLoading(false);
    };

    try {
      if (useServerChat) {
        const reply = await chatViaServer(text);
        updateAssistant(reply);
        if (voiceEnabled && voiceMode === "browser") {
          speakWithBrowser(reply, locale);
        }
        return;
      }

      if (!voiceEnabled && fastEnabled) {
        const reply = await chatViaServer(text);
        updateAssistant(reply);
        return;
      }

      if (!xiaozhiEnabled) {
        throw new Error(messages.xiaozhiFailed);
      }

      const session = getXiaozhiWsSession();
      const reply = await session.send(text, voiceEnabled, updateAssistant, endLoadingOnFirstText);
      updateAssistant(reply || messages.xiaozhiEmptyReply);
    } catch (error) {
      const wsFailed =
        !useServerChat &&
        error instanceof Error &&
        (error.message === "ws_error" ||
          error.message === "ws_closed" ||
          error.message === "connect_timeout" ||
          error.message === "timeout");

      if (wsFailed && fastEnabled) {
        try {
          const reply = await chatViaServer(text);
          updateAssistant(reply);
          if (voiceEnabled) {
            speakWithBrowser(reply, locale);
            setErrorText(messages.xiaozhiVoiceHint);
          }
          return;
        } catch {
          /* fall through */
        }
      }

      const message =
        error instanceof Error
          ? error.message === "ws_error" ||
              error.message === "ws_closed" ||
              error.message === "connect_timeout"
            ? messages.xiaozhiProxyHint
            : error.message === "timeout"
              ? messages.xiaozhiTimeoutHint
              : error.message
          : messages.xiaozhiFailed;
      setErrorText(message);
      updateAssistant(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="xiaozhi-chat-root">
      {open ? (
        <section className="xiaozhi-chat-panel" aria-label={messages.xiaozhiTitle}>
          <header className="xiaozhi-chat-header">
            <div className="xiaozhi-chat-avatar" aria-hidden>
              <span>楠</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="xiaozhi-chat-title">{messages.xiaozhiTitle}</p>
              <p className="xiaozhi-chat-status">
                <span className="xiaozhi-chat-status-dot" aria-hidden />
                {messages.xiaozhiSubtitle}
              </p>
            </div>
            <button
              type="button"
              className={`xiaozhi-chat-voice-toggle ${voiceEnabled ? "is-on" : ""}`}
              onClick={() => setVoiceEnabled((value) => !value)}
              title={voiceEnabled ? messages.xiaozhiVoiceOff : messages.xiaozhiVoiceOn}
              aria-label={voiceEnabled ? messages.xiaozhiVoiceOff : messages.xiaozhiVoiceOn}
            >
              {voiceEnabled ? "🔊" : "🔇"}
            </button>
            <button
              type="button"
              className="xiaozhi-chat-close"
              onClick={() => setOpen(false)}
              aria-label={messages.xiaozhiClose}
            >
              ×
            </button>
          </header>

          <div ref={listRef} className="xiaozhi-chat-list">
            {chatMessages.map((item) => (
              <div
                key={item.id}
                className={`xiaozhi-chat-bubble xiaozhi-chat-bubble--${item.role}${
                  loading && item.role === "assistant" && !item.content ? " is-typing" : ""
                }`}
              >
                {item.content ||
                  (loading && item.role === "assistant" ? messages.xiaozhiThinking : "")}
              </div>
            ))}
          </div>

          {errorText ? <p className="xiaozhi-chat-error">{errorText}</p> : null}

          <form className="xiaozhi-chat-form" onSubmit={onSubmit}>
            <input
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={messages.xiaozhiPlaceholder}
              className="xiaozhi-chat-input"
              disabled={loading}
            />
            <button type="submit" className="xiaozhi-chat-send" disabled={loading || !input.trim()}>
              {loading ? messages.xiaozhiSending : messages.xiaozhiSend}
            </button>
          </form>
        </section>
      ) : null}

      <button
        type="button"
        className={`xiaozhi-chat-fab ${open ? "xiaozhi-chat-fab--open" : ""}`}
        onClick={handleToggleOpen}
        aria-label={open ? messages.xiaozhiClose : messages.xiaozhiOpen}
      >
        <span className="xiaozhi-chat-fab-glow" aria-hidden />
        <span className="xiaozhi-chat-fab-core">{open ? "×" : "楠"}</span>
      </button>
    </div>
  );
}

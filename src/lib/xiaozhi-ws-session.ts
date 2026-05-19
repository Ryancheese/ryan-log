import { XiaozhiAudioPlayer } from "@/lib/xiaozhi-audio-player";
import { parseXiaozhiRaw, type XiaozhiJsonMessage } from "@/lib/xiaozhi-ws-message";

const WS_PROXY_URL =
  process.env.NEXT_PUBLIC_XIAOZHI_WS_PROXY_URL || "ws://127.0.0.1:8787";

type PendingRequest = {
  onPartial: (text: string) => void;
  onFirstText?: () => void;
  resolve: (text: string) => void;
  reject: (error: Error) => void;
  responseParts: string[];
  timeoutId: ReturnType<typeof setTimeout>;
};

export class XiaozhiWsSession {
  private ws: WebSocket | null = null;
  private ready = false;
  private connectPromise: Promise<void> | null = null;
  private pending: PendingRequest | null = null;
  private readonly audioPlayer = new XiaozhiAudioPlayer();

  async warmUp() {
    await this.audioPlayer.init();
    await this.ensureConnected();
  }

  close() {
    this.pending?.reject(new Error("session_closed"));
    this.clearPending();
    this.ready = false;
    this.connectPromise = null;
    this.audioPlayer.stop();
    try {
      this.ws?.close();
    } catch {
      /* ignore */
    }
    this.ws = null;
  }

  async send(
    text: string,
    voiceEnabled: boolean,
    onPartial: (content: string) => void,
    onFirstText?: () => void,
  ): Promise<string> {
    this.audioPlayer.setEnabled(voiceEnabled);

    let lastError: Error | null = null;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        await this.ensureConnected();
        return await this.sendOnce(text, onPartial, onFirstText);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error("ws_error");
        this.resetConnection();
        if (attempt === 0) {
          continue;
        }
      }
    }
    throw lastError ?? new Error("ws_error");
  }

  private async sendOnce(
    text: string,
    onPartial: (content: string) => void,
    onFirstText?: () => void,
  ) {
    if (this.pending) {
      this.pending.reject(new Error("busy"));
      this.clearPending();
    }

    return new Promise<string>((resolve, reject) => {
      const responseParts: string[] = [];
      const timeoutId = setTimeout(() => {
        const partial = responseParts.join("").trim();
        if (partial) {
          resolve(partial);
          this.clearPending();
          return;
        }
        this.clearPending();
        reject(new Error("timeout"));
      }, 90000);

      this.pending = {
        onPartial,
        onFirstText,
        resolve,
        reject,
        responseParts,
        timeoutId,
      };

      this.ws?.send(
        JSON.stringify({
          type: "listen",
          state: "detect",
          text,
          source: "text",
        }),
      );
    });
  }

  private resetConnection() {
    this.ready = false;
    this.connectPromise = null;
    try {
      this.ws?.close();
    } catch {
      /* ignore */
    }
    this.ws = null;
  }

  private async ensureConnected() {
    if (this.ready && this.ws?.readyState === WebSocket.OPEN) {
      return;
    }
    if (this.connectPromise) {
      return this.connectPromise;
    }

    this.connectPromise = new Promise<void>((resolve, reject) => {
      const ws = new WebSocket(WS_PROXY_URL);
      this.ws = ws;

      const connectTimeout = setTimeout(() => {
        reject(new Error("connect_timeout"));
        this.resetConnection();
      }, 20000);

      ws.onopen = () => {
        ws.send(
          JSON.stringify({
            type: "hello",
            version: 3,
            transport: "websocket",
            audio_params: {
              format: "opus",
              sample_rate: 16000,
              channels: 1,
              frame_duration: 60,
            },
          }),
        );
      };

      ws.onmessage = async (event) => {
        const { json, binary } = await parseXiaozhiRaw(event.data as Blob | ArrayBuffer | string);
        if (json) {
          this.handleJson(json, () => {
            clearTimeout(connectTimeout);
            resolve();
          });
          return;
        }
        if (binary) {
          void this.audioPlayer.playOpus(binary);
        }
      };

      ws.onerror = () => {
        clearTimeout(connectTimeout);
        reject(new Error("ws_error"));
        this.resetConnection();
      };

      ws.onclose = () => {
        this.ready = false;
        this.connectPromise = null;
        this.ws = null;

        if (!this.pending) {
          return;
        }

        const partial = this.pending.responseParts.join("").trim();
        if (partial) {
          this.pending.resolve(partial);
          this.clearPending();
          return;
        }

        this.pending.reject(new Error("ws_closed"));
        this.clearPending();
      };
    }).catch((error) => {
      this.connectPromise = null;
      throw error;
    });

    return this.connectPromise;
  }

  private handleJson(message: XiaozhiJsonMessage, onHelloReady?: () => void) {
    if (message.type === "hello") {
      this.ready = true;
      onHelloReady?.();
      return;
    }

    if (!this.pending) {
      return;
    }

    const pending = this.pending;

    if (message.type === "tts") {
      if (
        (message.state === "start" || message.state === "sentence_start") &&
        message.text?.trim()
      ) {
        pending.responseParts.push(message.text.trim());
        const merged = pending.responseParts.join("");
        pending.onPartial(merged);
        if (pending.onFirstText) {
          pending.onFirstText();
          pending.onFirstText = undefined;
        }
      }
      if (message.state === "stop" || message.state === "end") {
        const reply = pending.responseParts.join("").trim() || "阿楠想了想，但不知道怎么说～";
        pending.resolve(reply);
        this.clearPending();
      }
      return;
    }

    if (message.type === "llm" && message.text?.trim()) {
      pending.responseParts.push(message.text.trim());
      const merged = pending.responseParts.join("");
      pending.onPartial(merged);
      pending.onFirstText?.();
      pending.onFirstText = undefined;
    }
  }

  private clearPending() {
    if (!this.pending) {
      return;
    }
    clearTimeout(this.pending.timeoutId);
    this.pending = null;
  }
}

let sharedSession: XiaozhiWsSession | null = null;

export function getXiaozhiWsSession() {
  if (!sharedSession) {
    sharedSession = new XiaozhiWsSession();
  }
  return sharedSession;
}

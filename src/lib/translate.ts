import { cache } from "react";
import { createHash, randomUUID } from "node:crypto";
import { DEFAULT_LOCALE, type Locale } from "@/i18n/config";

const API_URL = process.env.TRANSLATE_API_URL;
const BAIDU_APP_ID = process.env.BAIDU_TRANSLATE_APP_ID;
const BAIDU_SECRET = process.env.BAIDU_TRANSLATE_SECRET;
const SOURCE_LANG = process.env.TRANSLATE_SOURCE_LANG || "zh";

const localeToLangCode: Record<Locale, string> = {
  zh: "zh",
  en: "en",
  ja: "jp",
};

const BAIDU_MAX_TEXT_LENGTH = 1800;
const RETRYABLE_ERROR_CODES = new Set(["54003", "52001", "52002"]);
const TRANSLATE_CACHE_MAX = 800;
const translateResultCache = new Map<string, string>();
const inFlightCache = new Map<string, Promise<string>>();

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type TranslateAttempt = {
  translated: string;
  errorCode?: string;
};

async function requestTranslate(text: string, target: string): Promise<TranslateAttempt> {
  if (!API_URL || !BAIDU_APP_ID || !BAIDU_SECRET) {
    return { translated: text };
  }

  const salt = randomUUID();
  const signRaw = `${BAIDU_APP_ID}${text}${salt}${BAIDU_SECRET}`;
  const sign = createHash("md5").update(signRaw).digest("hex");
  const body = new URLSearchParams({
    q: text,
    from: SOURCE_LANG,
    to: target,
    appid: BAIDU_APP_ID,
    salt,
    sign,
  });

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
    next: { revalidate: 86400 },
  });

  if (!response.ok) {
    return { translated: text, errorCode: "http_error" };
  }

  const data = (await response.json()) as {
    error_code?: string;
    error_msg?: string;
    trans_result?: Array<{ src?: string; dst?: string }>;
  };

  if (data.error_code || !data.trans_result?.length) {
    if (data.error_code) {
      console.warn(`[translate] baidu error ${data.error_code}: ${data.error_msg || "unknown"}`);
    }
    return { translated: text, errorCode: data.error_code || "empty_result" };
  }

  return {
    translated: data.trans_result.map((item) => item.dst || "").join("\n") || text,
  };
}

async function requestTranslateWithRetry(text: string, target: string): Promise<string> {
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const { translated, errorCode } = await requestTranslate(text, target);
    if (translated !== text) {
      return translated;
    }

    if (!errorCode || !RETRYABLE_ERROR_CODES.has(errorCode) || attempt === maxAttempts) {
      return translated;
    }
    await sleep(300 * attempt);
  }

  return text;
}

function splitLongText(text: string, maxLen = BAIDU_MAX_TEXT_LENGTH): string[] {
  if (text.length <= maxLen) {
    return [text];
  }

  const chunks: string[] = [];
  let buffer = "";

  const appendBuffer = () => {
    if (buffer) {
      chunks.push(buffer);
      buffer = "";
    }
  };

  for (const line of text.split("\n")) {
    const next = buffer ? `${buffer}\n${line}` : line;
    if (next.length <= maxLen) {
      buffer = next;
      continue;
    }

    appendBuffer();
    if (line.length <= maxLen) {
      buffer = line;
      continue;
    }

    let start = 0;
    while (start < line.length) {
      chunks.push(line.slice(start, start + maxLen));
      start += maxLen;
    }
  }

  appendBuffer();
  return chunks;
}

async function translateLargeText(text: string, target: string): Promise<string> {
  const parts = splitLongText(text);
  const translated: string[] = [];
  for (const part of parts) {
    translated.push(await requestTranslateWithRetry(part, target));
    await sleep(80);
  }
  return translated.join("\n");
}

async function translateMarkdownSafely(text: string, target: string): Promise<string> {
  // Keep fenced code blocks unchanged to avoid breaking code samples.
  const lines = text.split("\n");
  const result: string[] = [];
  let inCodeFence = false;
  let proseBuffer: string[] = [];

  const flushProse = async () => {
    if (!proseBuffer.length) {
      return;
    }
    const prose = proseBuffer.join("\n");
    proseBuffer = [];
    result.push(await translateLargeText(prose, target));
  };

  for (const line of lines) {
    const isFence = line.trimStart().startsWith("```");
    if (isFence) {
      await flushProse();
      inCodeFence = !inCodeFence;
      result.push(line);
      continue;
    }

    if (inCodeFence) {
      result.push(line);
      continue;
    }

    proseBuffer.push(line);
  }

  await flushProse();
  return result.join("\n");
}

function getCacheKey(text: string, target: string) {
  const digest = createHash("sha1").update(text).digest("hex");
  return `${target}:${digest}`;
}

function rememberTranslation(key: string, value: string) {
  if (translateResultCache.has(key)) {
    translateResultCache.delete(key);
  }
  translateResultCache.set(key, value);
  if (translateResultCache.size > TRANSLATE_CACHE_MAX) {
    const oldestKey = translateResultCache.keys().next().value;
    if (oldestKey) {
      translateResultCache.delete(oldestKey);
    }
  }
}

export const translateText = cache(async (text: string, locale: Locale) => {
  if (!text || locale === DEFAULT_LOCALE) {
    return text;
  }
  const target = localeToLangCode[locale];
  const cacheKey = getCacheKey(text, target);
  const cached = translateResultCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const pending = inFlightCache.get(cacheKey);
  if (pending) {
    return pending;
  }

  const task = translateMarkdownSafely(text, target)
    .then((translated) => {
      rememberTranslation(cacheKey, translated);
      return translated;
    })
    .finally(() => {
      inFlightCache.delete(cacheKey);
    });
  inFlightCache.set(cacheKey, task);
  return task;
});

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { head, put } from "@vercel/blob";

export type BackgroundMusicConfig = {
  enabled: boolean;
  url: string | null;
  title: string;
  volume: number;
  loop: boolean;
};

const DEFAULT_CONFIG: BackgroundMusicConfig = {
  enabled: false,
  url: null,
  title: "",
  volume: 0.35,
  loop: true,
};

const CONFIG_PATH = path.join(process.cwd(), "data/background-music.json");
const MUSIC_DIR = path.join(process.cwd(), "public/music");
const BLOB_CONFIG_KEY = "background-music/config.json";

const ALLOWED_MIME_TYPES = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/ogg",
  "audio/wav",
  "audio/webm",
  "audio/aac",
  "audio/mp4",
  "audio/x-m4a",
]);

const ALLOWED_EXTENSIONS = new Set([".mp3", ".ogg", ".wav", ".webm", ".m4a", ".aac"]);

const MAX_FILE_SIZE = 15 * 1024 * 1024;

function isBlobStorageEnabled(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function sanitizeConfig(raw: Partial<BackgroundMusicConfig>): BackgroundMusicConfig {
  return {
    enabled: Boolean(raw.enabled),
    url: typeof raw.url === "string" && raw.url.trim() ? raw.url.trim() : null,
    title: typeof raw.title === "string" ? raw.title.trim() : "",
    volume:
      typeof raw.volume === "number" && Number.isFinite(raw.volume)
        ? Math.min(1, Math.max(0, raw.volume))
        : DEFAULT_CONFIG.volume,
    loop: raw.loop !== false,
  };
}

async function readLocalConfig(): Promise<BackgroundMusicConfig> {
  try {
    const content = await readFile(CONFIG_PATH, "utf8");
    return sanitizeConfig(JSON.parse(content) as Partial<BackgroundMusicConfig>);
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

async function writeLocalConfig(config: BackgroundMusicConfig): Promise<void> {
  await mkdir(path.dirname(CONFIG_PATH), { recursive: true });
  await writeFile(CONFIG_PATH, `${JSON.stringify(config, null, 2)}\n`, "utf8");
}

async function readBlobConfig(): Promise<BackgroundMusicConfig | null> {
  try {
    const blob = await head(BLOB_CONFIG_KEY);
    const response = await fetch(blob.url, { cache: "no-store" });
    if (!response.ok) {
      return null;
    }
    return sanitizeConfig((await response.json()) as Partial<BackgroundMusicConfig>);
  } catch {
    return null;
  }
}

async function writeBlobConfig(config: BackgroundMusicConfig): Promise<void> {
  await put(BLOB_CONFIG_KEY, JSON.stringify(config, null, 2), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

export async function getBackgroundMusicConfig(): Promise<BackgroundMusicConfig> {
  if (isBlobStorageEnabled()) {
    const blobConfig = await readBlobConfig();
    if (blobConfig) {
      return blobConfig;
    }
  }
  return readLocalConfig();
}

export async function saveBackgroundMusicConfig(
  partial: Partial<BackgroundMusicConfig>,
): Promise<BackgroundMusicConfig> {
  const current = await getBackgroundMusicConfig();
  const next = sanitizeConfig({ ...current, ...partial });

  if (isBlobStorageEnabled()) {
    await writeBlobConfig(next);
  } else {
    await writeLocalConfig(next);
  }

  return next;
}

function getExtension(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  return ALLOWED_EXTENSIONS.has(ext) ? ext : ".mp3";
}

function isAllowedAudio(file: File): boolean {
  if (ALLOWED_MIME_TYPES.has(file.type)) {
    return true;
  }
  const ext = path.extname(file.name).toLowerCase();
  return ALLOWED_EXTENSIONS.has(ext);
}

export async function uploadBackgroundMusic(file: File): Promise<BackgroundMusicConfig> {
  if (!isAllowedAudio(file)) {
    throw new Error("UNSUPPORTED_FORMAT");
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("FILE_TOO_LARGE");
  }
  if (file.size === 0) {
    throw new Error("EMPTY_FILE");
  }

  const current = await getBackgroundMusicConfig();
  const ext = getExtension(file.name);
  const filename = `background${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  let url: string;

  if (isBlobStorageEnabled()) {
    const blob = await put(`background-music/${filename}`, buffer, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: file.type || "audio/mpeg",
    });
    url = blob.url;
  } else {
    await mkdir(MUSIC_DIR, { recursive: true });
    const filePath = path.join(MUSIC_DIR, filename);
    await writeFile(filePath, buffer);
    url = `/music/${filename}`;
  }

  const title = file.name.replace(/\.[^.]+$/, "") || current.title;

  return saveBackgroundMusicConfig({
    enabled: true,
    url,
    title,
  });
}

export function verifyAdminSecret(authorization: string | null): boolean {
  const secret = process.env.BGM_ADMIN_SECRET;
  if (!secret) {
    return false;
  }
  return authorization === `Bearer ${secret}`;
}

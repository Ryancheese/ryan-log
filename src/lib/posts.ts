import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
import type { Locale } from "@/i18n/config";
import { translateText } from "@/lib/translate";

const postsDirectory = path.join(process.cwd(), "src/content/posts");

function formatReadingTimeCn(content: string): string {
  const result = readingTime(content, { wordsPerMinute: 350 });
  const minutes = Math.max(1, Math.ceil(result.minutes));
  return `约 ${minutes} 分钟阅读`;
}

type PostFrontmatter = {
  title: string;
  date: string;
  summary: string;
  tags: string[];
  cover?: string;
  draft?: boolean;
  /** 自定义网址路径（仅小写英文/数字/连字符推荐），缺省则用文件名（不含 .mdx） */
  slug?: string;
};

export type PostMeta = PostFrontmatter & {
  slug: string;
  readingTime: string;
  dateText: string;
};

export type PostData = PostMeta & {
  content: string;
};

export type LocalizedPostMeta = PostMeta & {
  localizedTitle: string;
  localizedSummary: string;
};

export type LocalizedPostData = PostData & {
  localizedTitle: string;
  localizedSummary: string;
  localizedContent: string;
};

function normalizeDate(date: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
}

function canonicalSlugFromFile(filename: string, fm: PostFrontmatter): string {
  const stem = filename.replace(/\.mdx$/i, "").normalize("NFC");
  const fromFm = fm.slug?.trim().normalize("NFC");
  return (fromFm && fromFm.length > 0 ? fromFm : stem).normalize("NFC");
}

export function getAllPosts() {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const filenames = fs
    .readdirSync(postsDirectory)
    .filter((name) => name.endsWith(".mdx"));

  const posts = filenames
    .map((filename) => {
      const fullPath = path.join(postsDirectory, filename);
      const raw = fs.readFileSync(fullPath, "utf8");
      const { data, content } = matter(raw);
      const frontmatter = data as PostFrontmatter;
      const slug = canonicalSlugFromFile(filename, frontmatter);

      return {
        ...frontmatter,
        slug,
        readingTime: formatReadingTimeCn(content),
        dateText: normalizeDate(frontmatter.date),
      };
    })
    .filter((post) => !post.draft)
    .sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

  return posts;
}

export async function getAllLocalizedPosts(locale: Locale): Promise<LocalizedPostMeta[]> {
  const posts = getAllPosts();
  const localized: LocalizedPostMeta[] = [];

  for (const post of posts) {
    localized.push({
      ...post,
      localizedTitle: await translateText(post.title, locale),
      localizedSummary: await translateText(post.summary, locale),
    });
  }

  return localized;
}

function safeDecodeURIComponent(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

export function getPostBySlug(slug: string): PostData | null {
  const key = safeDecodeURIComponent(slug).normalize("NFC");

  const tryPath = path.join(postsDirectory, `${key}.mdx`);
  if (fs.existsSync(tryPath)) {
    const raw = fs.readFileSync(tryPath, "utf8");
    const { data, content } = matter(raw);
    const frontmatter = data as PostFrontmatter;
    const canonical = canonicalSlugFromFile(path.basename(tryPath), frontmatter);
    return {
      ...frontmatter,
      slug: canonical,
      content,
      readingTime: formatReadingTimeCn(content),
      dateText: normalizeDate(frontmatter.date),
    };
  }

  for (const filename of filenamesEndingInMdx()) {
    const fullPath = path.join(postsDirectory, filename);
    const raw = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(raw);
    const frontmatter = data as PostFrontmatter;
    const canonical = canonicalSlugFromFile(filename, frontmatter);
    const stem = filename.replace(/\.mdx$/i, "").normalize("NFC");
    if (canonical === key || stem === key) {
      return {
        ...frontmatter,
        slug: canonical,
        content,
        readingTime: formatReadingTimeCn(content),
        dateText: normalizeDate(frontmatter.date),
      };
    }
  }

  return null;
}

export async function getLocalizedPostBySlug(
  slug: string,
  locale: Locale,
): Promise<LocalizedPostData | null> {
  const post = getPostBySlug(slug);
  if (!post) {
    return null;
  }

  return {
    ...post,
    localizedTitle: await translateText(post.title, locale),
    localizedSummary: await translateText(post.summary, locale),
    localizedContent: await translateText(post.content, locale),
  };
}

function filenamesEndingInMdx(): string[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }
  return fs.readdirSync(postsDirectory).filter((name) => name.endsWith(".mdx"));
}

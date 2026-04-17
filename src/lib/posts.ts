import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";

const postsDirectory = path.join(process.cwd(), "src/content/posts");

type PostFrontmatter = {
  title: string;
  date: string;
  summary: string;
  tags: string[];
  cover?: string;
  draft?: boolean;
};

export type PostMeta = PostFrontmatter & {
  slug: string;
  readingTime: string;
  dateText: string;
};

export type PostData = PostMeta & {
  content: string;
};

function normalizeDate(date: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
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
      const slug = filename.replace(/\.mdx$/, "");
      const fullPath = path.join(postsDirectory, filename);
      const raw = fs.readFileSync(fullPath, "utf8");
      const { data, content } = matter(raw);
      const frontmatter = data as PostFrontmatter;

      return {
        ...frontmatter,
        slug,
        readingTime: readingTime(content).text,
        dateText: normalizeDate(frontmatter.date),
      };
    })
    .filter((post) => !post.draft)
    .sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

  return posts;
}

export function getPostBySlug(slug: string): PostData | null {
  const fullPath = path.join(postsDirectory, `${slug}.mdx`);
  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const raw = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(raw);
  const frontmatter = data as PostFrontmatter;

  return {
    ...frontmatter,
    slug,
    content,
    readingTime: readingTime(content).text,
    dateText: normalizeDate(frontmatter.date),
  };
}

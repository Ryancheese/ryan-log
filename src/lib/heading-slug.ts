import GithubSlugger from "github-slugger";

/** 与 rehype-slug 使用同一套 github-slugger 规则，保证目录锚点与正文标题 id 一致。 */
export function extractHeadingsFromMarkdown(content: string) {
  const slugger = new GithubSlugger();

  return content
    .split("\n")
    .filter((line) => line.startsWith("## "))
    .map((line) => {
      const text = line.replace(/^##\s+/, "").trim();
      return { text, id: slugger.slug(text) };
    });
}

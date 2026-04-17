# Ryan Log

一个极简技术风的个人博客模板，基于 `Next.js + TypeScript + Tailwind + MDX`。

## 本地开发

```bash
npm install
npm run dev
```

默认地址：`http://localhost:3000`

## 内容写作

- 文章目录：`src/content/posts/*.mdx`
- Frontmatter 字段：
  - `title`
  - `date`
  - `summary`
  - `tags`
  - `cover`
  - `draft`

## SEO 与输出

- 文章页动态 metadata
- 自动生成 `sitemap.xml`
- 自动生成 `robots.txt`
- 自动生成 `rss.xml`

## 统计（可选）

支持 Plausible，创建 `.env.local`：

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=your-domain.com
```

## 部署到 Vercel

1. 将项目推送到 GitHub 仓库。  
2. 登录 [Vercel](https://vercel.com)，导入该仓库。  
3. 在 Vercel 项目中配置环境变量（与 `.env.example` 一致）。  
4. 绑定自定义域名并启用 HTTPS。  
5. 每次 `git push` 后自动触发部署。

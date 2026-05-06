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

## 国际化与翻译 API

- 已支持三种语言路由：`/zh`、`/en`、`/ja`
- 旧路径（如 `/blog`）会自动重定向到默认语言路径（`/zh/blog`）
- 文案与文章内容可通过翻译 API 自动翻译（默认源语言：中文）

在 `.env.local` 中配置百度通用翻译 API：

```bash
TRANSLATE_API_URL=https://fanyi-api.baidu.com/api/trans/vip/translate
BAIDU_TRANSLATE_APP_ID=your-app-id
BAIDU_TRANSLATE_SECRET=your-secret
TRANSLATE_SOURCE_LANG=zh
```

如果 `TRANSLATE_API_URL`、`BAIDU_TRANSLATE_APP_ID` 或 `BAIDU_TRANSLATE_SECRET` 缺失，站点会回退到原始文案（不调用翻译接口）。

## 部署到 Vercel

1. 将项目推送到 GitHub 仓库。  
2. 登录 [Vercel](https://vercel.com)，导入该仓库。  
3. 在 Vercel 项目中配置环境变量（与 `.env.example` 一致）。  
4. 绑定自定义域名并启用 HTTPS。  
5. 每次 `git push` 后自动触发部署。

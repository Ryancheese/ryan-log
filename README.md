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

## 小智 AI 对话（可选）

博客右下角可接入 [小智 AI](https://xiaozhi.dev/docs/) 语音/文字对话。

### 方式 A：官方云端（推荐，含控制台「台湾女友 / 湾湾小何」）

控制台里配置的**智能体人设与音色**走云端 WebSocket，**不是** MCP 地址。

```bash
# 1. 注册 Web 设备并获取激活码
npm run xiaozhi:register

# 2. 打开 https://xiaozhi.me 控制台 → 设备管理 → 输入激活码 → 绑定你的智能体

# 3. 将脚本输出的变量写入 .env.local，然后：
npm run xiaozhi:proxy
npm run dev
```

`.env.local` 示例（以 `npm run xiaozhi:register` 输出为准）：

```bash
XIAOZHI_WS_URL=wss://api.tenclass.net/xiaozhi/v1/
XIAOZHI_DEVICE_TOKEN=test-token
XIAOZHI_DEVICE_ID=24:0A:C4:xx:xx:xx
XIAOZHI_CLIENT_ID=你的固定-client-uuid
NEXT_PUBLIC_XIAOZHI_WS_PROXY_URL=ws://127.0.0.1:8787
```

### 方式 B：本地 Docker 小智服务

```bash
XIAOZHI_WS_URL=ws://127.0.0.1:8000/xiaozhi/v1/
NEXT_PUBLIC_XIAOZHI_WS_PROXY_URL=ws://127.0.0.1:8787
```

### MCP 接入点（与博客聊天不同）

控制台「MCP 接入点」`wss://api.xiaozhi.me/mcp/?token=...` 用于把**外部 MCP 工具服务**接到智能体（如计算器、自定义 API），**不能**当作博客聊天的 WebSocket 地址。

若要为智能体扩展 MCP 工具，将完整 MCP 地址设为环境变量后，用 [mcp-calculator](https://github.com/78/mcp-calculator) 等方式连接：

```bash
export MCP_ENDPOINT='wss://api.xiaozhi.me/mcp/?token=你的token'
```

### 说明

- 浏览器经 `npm run xiaozhi:proxy` 转发（需 Device-Id 等头）。
- 🔊 开语音时走小智 TTS（云端为控制台音色）；🔇 可走 DeepSeek 快速文字通道。
- 设备凭证保存在 `.xiaozhi-device.json`（已 gitignore）。

## 部署到 Vercel（外网可用）

### 最小配置（推荐）

在 Vercel 项目 **Settings → Environment Variables** 添加：

| 变量 | 说明 |
|------|------|
| `DEEPSEEK_API_KEY` | DeepSeek API Key，外网访客可直接与阿楠文字聊天 |
| `DEEPSEEK_MODEL` | 可选，默认 `deepseek-chat` |

**不要**在生产环境设置 `NEXT_PUBLIC_XIAOZHI_WS_PROXY_URL=ws://127.0.0.1:8787`（仅本机有效）。  
未配置本地代理时，站点会自动走 **服务端 API 模式**，全球可访问。

部署步骤：

1. 推送代码到 GitHub  
2. [Vercel](https://vercel.com) 导入仓库  
3. 填入上表环境变量（Production / Preview 均可）  
4. Deploy  

🔊 生产环境语音使用**浏览器朗读**（台湾腔 zh-TW）；湾湾小何 Opus 需自建公网 WebSocket 代理（见下）。

### 可选：Vercel 连小智云端

若已在 [xiaozhi.me](https://xiaozhi.me) 绑定设备，可额外配置：

```bash
XIAOZHI_WS_URL=wss://api.tenclass.net/xiaozhi/v1/
XIAOZHI_DEVICE_ID=你的MAC格式设备ID
XIAOZHI_CLIENT_ID=固定UUID
XIAOZHI_DEVICE_TOKEN=test-token
```

并设置 `NEXT_PUBLIC_XIAOZHI_USE_SERVER_CHAT=true`，优先走 `/api/xiaozhi/chat`（较慢，用人设来自云端）。

### 可选：公网 Opus 语音代理

将 `scripts/xiaozhi-ws-proxy.mjs` 部署到 Railway / VPS 后：

```bash
NEXT_PUBLIC_XIAOZHI_WS_PROXY_URL=wss://你的域名/xiaozhi-proxy
XIAOZHI_WS_URL=wss://api.tenclass.net/xiaozhi/v1/  # 或自建小智
```

可用仓库内 `Dockerfile.ws-proxy` 构建镜像。

### 本地开发

见上文「小智 AI 对话」；本地保留 `NEXT_PUBLIC_XIAOZHI_WS_PROXY_URL=ws://127.0.0.1:8787` + `npm run xiaozhi:proxy` 即可 Opus 真声。

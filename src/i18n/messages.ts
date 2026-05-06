import { DEFAULT_LOCALE, type Locale } from "@/i18n/config";

type Messages = {
  navHome: string;
  navBlog: string;
  profile: string;
  profileShort: string;
  role: string;
  heroBadge: string;
  heroTitle: string;
  heroHighlight: string;
  heroDesc: string;
  heroProfileHintPrefix: string;
  heroProfileHintLink: string;
  heroProfileHintSuffix: string;
  readLatest: string;
  contactMe: string;
  featuredPosts: string;
  viewAll: string;
  allPostsTitle: string;
  allPostsDesc: string;
  postDirectory: string;
  backToPosts: string;
  toc: string;
  footer: string;
  profileTag: string;
  profileDesc: string;
  netease: string;
  backHome: string;
};

const messagesMap: Record<Locale, Messages> = {
  zh: {
    navHome: "首页",
    navBlog: "博客",
    profile: "个人信息",
    profileShort: "资料",
    role: "资深前端工程师",
    heroBadge: "资深前端工程师 · 创作者",
    heroTitle: "用极简方式记录技术成长，",
    heroHighlight: "构建可复用的前端工程经验。",
    heroDesc: "这里是我的个人博客，聚焦 Next.js、TypeScript、工程化与产品实践。我会持续分享可以直接应用到项目中的方案与思考。",
    heroProfileHintPrefix: "个人介绍与联系方式请点顶部头像旁的",
    heroProfileHintLink: "个人信息",
    heroProfileHintSuffix: "查看。",
    readLatest: "阅读最新文章",
    contactMe: "联系我",
    featuredPosts: "精选文章",
    viewAll: "查看全部",
    allPostsTitle: "全部文章",
    allPostsDesc: "当前共 {count} 篇文章，覆盖前端开发、工程实践与学习复盘。",
    postDirectory: "文章目录",
    backToPosts: "返回文章列表",
    toc: "目录",
    footer: "本站使用 Next.js 构建。",
    profileTag: "个人档案",
    profileDesc: "写代码、做工程化，也偶尔写歌。欢迎通过邮箱或网易云音乐与我联系。",
    netease: "网易云音乐人主页",
    backHome: "返回首页",
  },
  en: {
    navHome: "Home",
    navBlog: "Blog",
    profile: "Profile",
    profileShort: "Profile",
    role: "Senior Frontend Engineer",
    heroBadge: "Senior Frontend Engineer · Creator",
    heroTitle: "Documenting growth with minimalism,",
    heroHighlight: "building reusable frontend engineering experience.",
    heroDesc:
      "This is my personal blog, focused on Next.js, TypeScript, engineering practices, and product thinking. I continuously share ideas you can apply directly in real projects.",
    heroProfileHintPrefix: "For my introduction and contact details, click",
    heroProfileHintLink: "Profile",
    heroProfileHintSuffix: "next to the avatar in the header.",
    readLatest: "Read latest posts",
    contactMe: "Contact me",
    featuredPosts: "Featured Posts",
    viewAll: "View all",
    allPostsTitle: "All Posts",
    allPostsDesc: "There are {count} posts covering frontend development and engineering practices.",
    postDirectory: "Directory",
    backToPosts: "Back to posts",
    toc: "Table of Contents",
    footer: "Built with Next.js.",
    profileTag: "Profile",
    profileDesc: "I write code, build engineering systems, and occasionally compose music. Feel free to reach out by email or NetEase Music.",
    netease: "NetEase Musician Page",
    backHome: "Back to Home",
  },
  ja: {
    navHome: "ホーム",
    navBlog: "ブログ",
    profile: "プロフィール",
    profileShort: "情報",
    role: "シニアフロントエンドエンジニア",
    heroBadge: "シニアフロントエンドエンジニア · クリエイター",
    heroTitle: "ミニマルに技術の成長を記録し、",
    heroHighlight: "再利用できるフロントエンド知見を構築する。",
    heroDesc:
      "ここは私の個人ブログです。Next.js、TypeScript、開発効率化、プロダクト実践を中心に、実務で使える考え方と実装を継続的に共有します。",
    heroProfileHintPrefix: "自己紹介と連絡先は、ヘッダーのアバター横にある",
    heroProfileHintLink: "プロフィール",
    heroProfileHintSuffix: "をご覧ください。",
    readLatest: "最新記事を読む",
    contactMe: "連絡する",
    featuredPosts: "注目記事",
    viewAll: "すべて見る",
    allPostsTitle: "すべての記事",
    allPostsDesc: "現在 {count} 件の記事があります。フロントエンド開発と実践知を扱っています。",
    postDirectory: "記事一覧",
    backToPosts: "記事一覧に戻る",
    toc: "目次",
    footer: "このサイトは Next.js で構築されています。",
    profileTag: "プロフィール",
    profileDesc: "コードを書き、開発基盤を作り、ときどき作曲もします。メールまたはNetEase Musicでお気軽にご連絡ください。",
    netease: "NetEase ミュージシャンページ",
    backHome: "ホームへ戻る",
  },
};

export function getMessages(locale: Locale): Messages {
  return messagesMap[locale] ?? messagesMap[DEFAULT_LOCALE];
}

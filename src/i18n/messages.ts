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
  translateArticle: string;
  translatingArticle: string;
  articleTranslated: string;
  translateNotNeeded: string;
  translateFailed: string;
  xiaozhiTitle: string;
  xiaozhiSubtitle: string;
  xiaozhiWelcome: string;
  xiaozhiPlaceholder: string;
  xiaozhiSend: string;
  xiaozhiSending: string;
  xiaozhiThinking: string;
  xiaozhiOpen: string;
  xiaozhiClose: string;
  xiaozhiFailed: string;
  xiaozhiEmptyReply: string;
  xiaozhiVoiceOn: string;
  xiaozhiVoiceOff: string;
  xiaozhiVoiceHint: string;
  xiaozhiProxyHint: string;
  xiaozhiTimeoutHint: string;
  bgmPlay: string;
  bgmPause: string;
  bgmMute: string;
  bgmUnmute: string;
  bgmOpen: string;
  bgmCollapse: string;
  bgmDefaultTitle: string;
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
    translateArticle: "翻译本文",
    translatingArticle: "翻译中...",
    articleTranslated: "已翻译",
    translateNotNeeded: "当前语言无需翻译",
    translateFailed: "翻译失败，请稍后重试",
    xiaozhiTitle: "阿楠",
    xiaozhiSubtitle: "在线，来唠嗑",
    xiaozhiWelcome: "哈啰～我是阿楠，台湾腔陪聊啦！想聊心情、八卦、日常都可以，随便开话题～",
    xiaozhiPlaceholder: "想说点什么…",
    xiaozhiSend: "发送",
    xiaozhiSending: "发送中",
    xiaozhiThinking: "阿楠思考中...",
    xiaozhiOpen: "打开阿楠对话",
    xiaozhiClose: "关闭阿楠对话",
    xiaozhiFailed: "对话失败，请稍后重试",
    xiaozhiEmptyReply: "阿楠暂时没有想好怎么说～",
    xiaozhiVoiceOn: "开启语音",
    xiaozhiVoiceOff: "关闭语音",
    xiaozhiVoiceHint: "本次用文字回复；若需语音请确认已运行 npm run xiaozhi:proxy",
    xiaozhiProxyHint: "连不上语音服务，请先运行 npm run xiaozhi:proxy",
    xiaozhiTimeoutHint: "回复超时了，再试一次或关掉语音",
    bgmPlay: "播放背景音乐",
    bgmPause: "暂停背景音乐",
    bgmMute: "静音",
    bgmUnmute: "取消静音",
    bgmOpen: "打开背景音乐控制",
    bgmCollapse: "收起控制面板",
    bgmDefaultTitle: "背景音乐",
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
    translateArticle: "Translate Article",
    translatingArticle: "Translating...",
    articleTranslated: "Translated",
    translateNotNeeded: "No translation needed",
    translateFailed: "Translation failed. Please try again.",
    xiaozhiTitle: "Anan",
    xiaozhiSubtitle: "Online · Chat",
    xiaozhiWelcome: "Hey! I'm Anan. Let's just chat—life, moods, random stuff. No tech homework.",
    xiaozhiPlaceholder: "Say something…",
    xiaozhiSend: "Send",
    xiaozhiSending: "Sending",
    xiaozhiThinking: "XiaoZhi is thinking...",
    xiaozhiOpen: "Open XiaoZhi chat",
    xiaozhiClose: "Close XiaoZhi chat",
    xiaozhiFailed: "Chat failed. Please try again.",
    xiaozhiEmptyReply: "No reply content received.",
    xiaozhiVoiceOn: "Enable voice",
    xiaozhiVoiceOff: "Disable voice",
    xiaozhiVoiceHint: "Text reply only; run npm run xiaozhi:proxy for voice",
    xiaozhiProxyHint: "Voice service unavailable; run npm run xiaozhi:proxy",
    xiaozhiTimeoutHint: "Timed out—try again or turn voice off",
    bgmPlay: "Play background music",
    bgmPause: "Pause background music",
    bgmMute: "Mute",
    bgmUnmute: "Unmute",
    bgmOpen: "Open music controls",
    bgmCollapse: "Collapse panel",
    bgmDefaultTitle: "Background music",
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
    translateArticle: "この記事を翻訳",
    translatingArticle: "翻訳中...",
    articleTranslated: "翻訳済み",
    translateNotNeeded: "この言語は翻訳不要",
    translateFailed: "翻訳に失敗しました。後でもう一度お試しください。",
    xiaozhiTitle: "阿楠",
    xiaozhiSubtitle: "オンライン",
    xiaozhiWelcome: "こんにちは、阿楠です。雑談しましょう！",
    xiaozhiPlaceholder: "話したいことを入力…",
    xiaozhiSend: "送信",
    xiaozhiSending: "送信中",
    xiaozhiThinking: "考え中…",
    xiaozhiOpen: "チャットを開く",
    xiaozhiClose: "チャットを閉じる",
    xiaozhiFailed: "チャットに失敗しました。後でもう一度お試しください。",
    xiaozhiEmptyReply: "返信がありません。",
    xiaozhiVoiceOn: "音声をオン",
    xiaozhiVoiceOff: "音声をオフ",
    xiaozhiVoiceHint: "テキストで返信しました",
    xiaozhiProxyHint: "音声サービスに接続できません",
    xiaozhiTimeoutHint: "タイムアウトしました",
    bgmPlay: "BGMを再生",
    bgmPause: "BGMを一時停止",
    bgmMute: "ミュート",
    bgmUnmute: "ミュート解除",
    bgmOpen: "BGMコントロールを開く",
    bgmCollapse: "パネルを閉じる",
    bgmDefaultTitle: "BGM",
  },
};

export function getMessages(locale: Locale): Messages {
  return messagesMap[locale] ?? messagesMap[DEFAULT_LOCALE];
}

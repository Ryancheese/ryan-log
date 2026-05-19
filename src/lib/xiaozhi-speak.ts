/** 生产环境用浏览器朗读（无需本地小智 Opus） */
export function speakWithBrowser(text: string, locale: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return;
  }
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) {
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.lang =
    locale === "en" ? "en-US" : locale === "ja" ? "ja-JP" : "zh-TW";
  utterance.rate = 1.05;
  window.speechSynthesis.speak(utterance);
}

// ── Internationalization helpers for AI prompts ──────────────────────────────

export type AppLanguage = "en" | "hi" | "ur" | "ar" | "es" | "fr" | "de" | "ja" | "zh" | "ko" | "pt" | "ru" | "it";

/**
 * Returns a prompt snippet that instructs the AI to detect the user's language
 * from their message and respond accordingly.
 */
export function getAILanguageDetectionPrompt(): string {
  return `LANGUAGE DETECTION: Detect the language the user is writing in. If the user writes in a non-English language, respond in that same language. If the user writes in English, respond in English. Always match the user's language.`;
}

/**
 * Returns a prompt snippet that instructs the AI to respond in a specific language.
 */
export function getAIResponseLanguagePrompt(lang: AppLanguage): string {
  const langMap: Record<AppLanguage, string> = {
    en: "English",
    hi: "Hindi",
    ur: "Urdu",
    ar: "Arabic",
    es: "Spanish",
    fr: "French",
    de: "German",
    ja: "Japanese",
    zh: "Chinese",
    ko: "Korean",
    pt: "Portuguese",
    ru: "Russian",
    it: "Italian",
  };
  const langName = langMap[lang] || "English";
  return `PREFERRED LANGUAGE: The user's preferred app language is ${langName}. If the user writes in ${langName}, always respond in ${langName}. If the user writes in a different language, respond in that language instead.`;
}

export const LIMIT_PER_PAGE = 100;
export const POSTS_PER_PAGE = 16;
export const SITE_NAME = "Scriptone";
export const BASE_URL = "https://rmc-8.com";

// サポートされている言語
export const SUPPORTED_LANGUAGES = ["ja", "en", "ko"] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

// デフォルト言語
export const DEFAULT_LANGUAGE: SupportedLanguage = "ja";

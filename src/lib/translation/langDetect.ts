const SUPPORTED = ["en", "es", "zh", "fr", "de", "pt", "ja", "ar", "ru", "ko"];
const STORAGE_KEY = "vivim_lang";

export function detectLanguage(): string {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && SUPPORTED.includes(stored)) return stored;

  const browser = navigator.language?.split("-")[0]?.toLowerCase();
  if (browser && SUPPORTED.includes(browser)) return browser;

  return "en";
}

export function setLanguagePreference(lang: string): void {
  localStorage.setItem(STORAGE_KEY, lang);
}

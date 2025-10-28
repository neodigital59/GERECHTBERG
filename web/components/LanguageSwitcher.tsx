"use client";
import { useEffect, useState } from "react";
import i18n from "@/lib/i18n";

const LANGS = [
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
  { code: "ru", label: "Русский" },
  { code: "tr", label: "Türkçe" },
  { code: "zh", label: "中文" },
  { code: "es", label: "Español" },
  { code: "it", label: "Italiano" },
  { code: "pt", label: "Português" },
  { code: "ar", label: "العربية" },
  { code: "ja", label: "日本語" },
];

export default function LanguageSwitcher() {
  // Normalize language to primary subtag (e.g., de-DE -> de)
  const normalize = (lng?: string) => (lng || "fr").split("-")[0].toLowerCase();

  // Lire d'abord l'état i18n pour refléter la langue réellement active
  // (le cookie est synchronisé ensuite pour le SSR)
  const initial = normalize(i18n.resolvedLanguage || i18n.language || "fr");
  const [lang, setLang] = useState<string>(initial);

  // Keep the <select> bound to component state to avoid display drift
  // We still sync state from i18n on mount and on languageChanged.

  useEffect(() => {
    // Reflect current language on the <html lang> attribute for accessibility and detection
    try {
      const current = normalize(i18n.resolvedLanguage || i18n.language || "fr");
      // Ensure the selector reflects the actual detected language on mount
      setLang(current);
      document.documentElement.lang = current;
      document.documentElement.dir = current === "ar" ? "rtl" : "ltr";
    // Persister la langue en cookie pour le SSR et aligner html
    document.cookie = `i18next=${current}; path=/; max-age=${60*60*24*365}`;
    } catch {}

    const handle = (lng?: string) => {
      const next = normalize(lng || i18n.resolvedLanguage || i18n.language || "fr");
      setLang(next);
      try {
        document.documentElement.lang = next;
        document.documentElement.dir = next === "ar" ? "rtl" : "ltr";
      } catch {}
    };
    i18n.on("languageChanged", handle);
    return () => { i18n.off("languageChanged", handle); };
  }, []);

  async function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const v = normalize(e.target.value);
    setLang(v);
    try { localStorage.setItem("i18nextLng", v); } catch {}
    await i18n.changeLanguage(v);
    try {
      document.documentElement.lang = v;
      document.documentElement.dir = v === "ar" ? "rtl" : "ltr";
      document.cookie = `i18next=${v}; path=/; max-age=${60*60*24*365}`;
    } catch {}
    // No reload: components using useTranslation will update on languageChanged
  }

  return (
    <label className="flex items-center gap-2 text-sm" title="Langue">
      <span className="sr-only">Langue</span>
      <select
        className="px-2 py-1 border rounded bg-white dark:bg-black/10"
        value={lang}
        onChange={onChange}
      >
        {LANGS.map((l) => (
          <option key={l.code} value={l.code}>{l.label}</option>
        ))}
      </select>
    </label>
  );
}
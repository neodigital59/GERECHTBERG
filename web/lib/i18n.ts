import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

// Initialize i18next only once
if (!i18n.isInitialized) {
  i18n
    .use(HttpBackend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      // Core
      fallbackLng: 'fr',
      supportedLngs: ['fr', 'en', 'de', 'ru', 'tr', 'zh', 'es', 'it', 'pt', 'ar', 'ja'],
      defaultNS: 'common',
      ns: ['common'],
      interpolation: { escapeValue: false },

      // React integration
      react: {
        useSuspense: false,
        bindI18n: 'languageChanged loaded',
        bindI18nStore: 'added removed'
      },

      // Load translation JSON from public/locales
      backend: {
        loadPath: '/locales/{{lng}}/{{ns}}.json',
      },

      // Détection et persistance de la langue
      // Priorité au cookie (posé par middleware et LanguageSwitcher) pour synchroniser SSR/CSR
      detection: {
        order: ['cookie', 'localStorage', 'querystring', 'navigator'],
        caches: ['cookie', 'localStorage'],
      },

      // Debug in development if needed
      // debug: process.env.NODE_ENV === 'development',
    });
}

export default i18n;
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';
import frCommon from '@/public/locales/fr/common.json';
import enCommon from '@/public/locales/en/common.json';
import deCommon from '@/public/locales/de/common.json';
import ruCommon from '@/public/locales/ru/common.json';
import trCommon from '@/public/locales/tr/common.json';
import zhCommon from '@/public/locales/zh/common.json';
import esCommon from '@/public/locales/es/common.json';
import itCommon from '@/public/locales/it/common.json';
import ptCommon from '@/public/locales/pt/common.json';
import arCommon from '@/public/locales/ar/common.json';
import jaCommon from '@/public/locales/ja/common.json';

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
      resources: {
        fr: { common: frCommon as unknown as Record<string, string> },
        en: { common: enCommon as unknown as Record<string, string> },
        de: { common: deCommon as unknown as Record<string, string> },
        ru: { common: ruCommon as unknown as Record<string, string> },
        tr: { common: trCommon as unknown as Record<string, string> },
        zh: { common: zhCommon as unknown as Record<string, string> },
        es: { common: esCommon as unknown as Record<string, string> },
        it: { common: itCommon as unknown as Record<string, string> },
        pt: { common: ptCommon as unknown as Record<string, string> },
        ar: { common: arCommon as unknown as Record<string, string> },
        ja: { common: jaCommon as unknown as Record<string, string> },
      },

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
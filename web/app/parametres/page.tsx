"use client";
import { useTranslation } from 'react-i18next';
import RequireAuth from '@/components/RequireAuth';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import PageContent from '@/components/PageContent';

export default function SettingsPage() {
  const { t } = useTranslation();
  return (
    <RequireAuth>
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{t('settings.title')}</h1>
            <p className="text-sm text-black/70 dark:text-white/70">{t('settings.subtitle')}</p>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          <section className="bg-white border rounded-xl p-4 shadow-sm">
            <h2 className="font-medium mb-2">{t('settings.language.title')}</h2>
            <p className="text-sm text-black/70 mb-3">{t('settings.language.description')}</p>
            <LanguageSwitcher />
          </section>
          <section className="bg-white border rounded-xl p-4 shadow-sm">
            <PageContent slug="parametres" />
          </section>
        </div>
      </div>
    </RequireAuth>
  );
}
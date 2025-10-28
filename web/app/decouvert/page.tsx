'use client';

import Image from "next/image";
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import Link from 'next/link';
import PageContent from "@/components/PageContent";

export default function DecouvertPage() {
  const { t } = useTranslation();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };
  
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">{t('discover.title')}</h1>
        <p className="text-sm sm:text-base text-black/70 dark:text-white/70">
          {t('discover.subtitle')}
        </p>
      </header>

      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="group relative border rounded-xl p-3 sm:p-4 bg-white shadow-sm ring-1 ring-black/5 transform-gpu transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:bg-black/[0.02] hover:ring-brand/40 cursor-pointer">
          <Image aria-hidden src="/file.svg" alt="Icône" width={20} height={20} className="mb-2 dark:invert transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
          <h2 className="font-medium mb-1">{t('discover.features.writing.title')}</h2>
          <p className="text-sm text-black/70">{t('discover.features.writing.description')}</p>
        </div>
        <div className="group relative border rounded-xl p-3 sm:p-4 bg-white shadow-sm ring-1 ring-black/5 transform-gpu transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:bg-black/[0.02] hover:ring-brand/40 cursor-pointer">
          <Image aria-hidden src="/window.svg" alt="Icône" width={20} height={20} className="mb-2 dark:invert transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
          <h2 className="font-medium mb-1">{t('discover.features.signature.title')}</h2>
          <p className="text-sm text-black/70">{t('discover.features.signature.description')}</p>
        </div>
        <div className="group relative border rounded-xl p-3 sm:p-4 bg-white shadow-sm ring-1 ring-black/5 transform-gpu transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:bg-black/[0.02] hover:ring-brand/40 cursor-pointer">
          <Image aria-hidden src="/next.svg" alt="Icône" width={20} height={20} className="mb-2 dark:invert transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
          <h2 className="font-medium mb-1">{t('discover.features.versions.title')}</h2>
          <p className="text-sm text-black/70">{t('discover.features.versions.description')}</p>
        </div>
        <div className="group relative border rounded-xl p-3 sm:p-4 bg-white shadow-sm ring-1 ring-black/5 transform-gpu transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:bg-black/[0.02] hover:ring-brand/40 cursor-pointer">
          <Image aria-hidden src="/file.svg" alt="Icône" width={20} height={20} className="mb-2 dark:invert transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
          <h2 className="font-medium mb-1">{t('discover.features.export.title')}</h2>
          <p className="text-sm text-black/70">{t('discover.features.export.description')}</p>
        </div>
        <div className="group relative border rounded-xl p-3 sm:p-4 bg-white shadow-sm ring-1 ring-black/5 transform-gpu transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:bg-black/[0.02] hover:ring-brand/40 cursor-pointer">
          <Image aria-hidden src="/globe.svg" alt="Icône" width={20} height={20} className="mb-2 dark:invert transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
          <h2 className="font-medium mb-1">{t('discover.features.multilingual.title')}</h2>
          <p className="text-sm text-black/70">{t('discover.features.multilingual.description')}</p>
        </div>
        <div className="group relative border rounded-xl p-3 sm:p-4 bg-white shadow-sm ring-1 ring-black/5 transform-gpu transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:bg-black/[0.02] hover:ring-brand/40 cursor-pointer">
          <Image aria-hidden src="/vercel.svg" alt="Icône" width={20} height={20} className="mb-2 dark:invert transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
          <h2 className="font-medium mb-1">{t('discover.features.sharing.title')}</h2>
          <p className="text-sm text-black/70">{t('discover.features.sharing.description')}</p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg sm:text-xl font-semibold">{t('discover.howItWorks.title')}</h2>
        <div className="space-y-2">
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-brand text-white text-sm font-medium rounded-full flex items-center justify-center">1</span>
            <p className="text-sm text-black/70">{t('discover.howItWorks.steps.1')}</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-brand text-white text-sm font-medium rounded-full flex items-center justify-center">2</span>
            <p className="text-sm text-black/70">{t('discover.howItWorks.steps.2')}</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-brand text-white text-sm font-medium rounded-full flex items-center justify-center">3</span>
            <p className="text-sm text-black/70">{t('discover.howItWorks.steps.3')}</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-brand text-white text-sm font-medium rounded-full flex items-center justify-center">4</span>
            <p className="text-sm text-black/70">{t('discover.howItWorks.steps.4')}</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-brand text-white text-sm font-medium rounded-full flex items-center justify-center">5</span>
            <p className="text-sm text-black/70">{t('discover.howItWorks.steps.5')}</p>
          </div>
        </div>
      </section>

      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-lg font-semibold text-brand">{t('discover.stats.creationTime.value')}</div>
          <div className="text-sm text-black/70">{t('discover.stats.creationTime.label')}</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-brand">{t('discover.stats.formats.value')}</div>
          <div className="text-sm text-black/70">{t('discover.stats.formats.label')}</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-brand">{t('discover.stats.languages.value')}</div>
          <div className="text-sm text-black/70">{t('discover.stats.languages.label')}</div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg sm:text-xl font-semibold">{t('discover.faq.title')}</h2>
        <div className="space-y-2">
          <div className="border rounded-lg">
            <button
              onClick={() => toggleFaq(1)}
              className="w-full px-3 sm:px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50"
            >
              <span className="font-medium">{t('discover.faq.q1.question')}</span>
          <span className={`inline-block transition-transform ${openFaq === 1 ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {openFaq === 1 && (
              <div className="px-4 pb-3 text-sm text-black/70">
                {t('discover.faq.q1.answer')}
              </div>
            )}
          </div>
          
          <div className="border rounded-lg">
            <button
              onClick={() => toggleFaq(2)}
              className="w-full px-3 sm:px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50"
            >
              <span className="font-medium">{t('discover.faq.q2.question')}</span>
          <span className={`inline-block transition-transform ${openFaq === 2 ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {openFaq === 2 && (
              <div className="px-4 pb-3 text-sm text-black/70">
                {t('discover.faq.q2.answer')}
              </div>
            )}
          </div>
          
          <div className="border rounded-lg">
            <button
              onClick={() => toggleFaq(3)}
              className="w-full px-3 sm:px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50"
            >
              <span className="font-medium">{t('discover.faq.q3.question')}</span>
          <span className={`inline-block transition-transform ${openFaq === 3 ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {openFaq === 3 && (
              <div className="px-4 pb-3 text-sm text-black/70">
                {t('discover.faq.q3.answer')}
              </div>
            )}
          </div>
          
          <div className="border rounded-lg">
            <button
              onClick={() => toggleFaq(4)}
              className="w-full px-3 sm:px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50"
            >
              <span className="font-medium">{t('discover.faq.q4.question')}</span>
          <span className={`inline-block transition-transform ${openFaq === 4 ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {openFaq === 4 && (
              <div className="px-4 pb-3 text-sm text-black/70">
                {t('discover.faq.q4.answer')}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
        <Link href="/tarifs" className="w-full sm:flex-1 bg-brand text-white px-6 py-3 rounded-lg text-center font-medium hover:bg-brand/90 transition-colors">
          {t('discover.cta.pricing')}
        </Link>
        <Link href="/documents" className="w-full sm:flex-1 border border-brand text-brand px-6 py-3 rounded-lg text-center font-medium hover:bg-brand/5 transition-colors">
          {t('discover.cta.dashboard')}
        </Link>
      </section>

      <footer className="text-xs text-black/50 pt-4 border-t">
        {t('discover.disclaimer')}
      </footer>

      {/* Contenu CMS gérable */}
      <PageContent slug="decouvert" className="mt-8" />
    </div>
  );
}
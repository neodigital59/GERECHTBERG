"use client";
import Image from "next/image";
import PageContent from "@/components/PageContent";
import { ComposeSquarePro, TranslateSquarePro, ExportSquarePro, ComposeProWide, TranslateProWide, ExportProWide, ComposeIconPro, TranslateIconPro, ExportIconPro, TerminationProSquare, ContractProSquare, CertificateProSquare, Step1Wide, Step2Wide, Step3Wide } from "@/components/GeneratedIllustrations";
import { useTranslation } from "react-i18next";

export default function Home() {
  const { t } = useTranslation();
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 sm:space-y-10">
      {/* En-tête / Hero */}
      <header className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">GERECHTBERG</h1>
        <p className="text-sm sm:text-base text-black/70 dark:text-white/70">
          {t('home.tagline')}
        </p>
      </header>


      {/* Hero visuel */}
      <section className="rounded-xl overflow-hidden border bg-white shadow-sm ring-1 ring-black/5">
        <Image
          src="/asset/Hero2.png"
          alt={t('home.hero.alt')}
          width={1200}
          height={675}
          priority
          sizes="100vw"
          className="w-full h-auto"
        />
      </section>

      {/* CTA principaux */}
      <section className="flex flex-wrap gap-2 sm:gap-3">
        <a href="/documents" className="w-full sm:w-auto rounded px-4 py-2 bg-brand text-white hover:bg-brand/80">{t('home.cta.create')}</a>
        <a href="/decouvert" className="w-full sm:w-auto rounded px-4 py-2 border hover:text-brand">{t('home.cta.discover')}</a>
        <a href="/tarifs" className="w-full sm:w-auto rounded px-4 py-2 border hover:text-brand">{t('home.cta.pricing')}</a>
      </section>

      {/* Fonctionnalités */}
      <section className="space-y-3">
        <h2 className="text-xl font-medium">{t('home.features.title')}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="group relative border rounded-xl p-3 sm:p-4 bg-white shadow-sm ring-1 ring-black/5 transform-gpu transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:bg-black/[0.02] hover:ring-brand/40">
            <ComposeIconPro ariaLabel={t('home.features.write.alt')} width={20} height={20} className="mb-2 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
            <h3 className="font-medium mb-1">{t('home.features.write.title')}</h3>
            <p className="text-sm text-black/70">{t('home.features.write.desc')}</p>
            <ComposeSquarePro ariaLabel={t('home.features.write.alt')} width={512} height={512} className="mt-3 w-full h-auto rounded border ring-1 ring-black/5" />
          </div>
          <div className="group relative border rounded-xl p-3 sm:p-4 bg-white shadow-sm ring-1 ring-black/5 transform-gpu transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:bg-black/[0.02] hover:ring-brand/40">
            <TranslateIconPro ariaLabel={t('home.features.translate.alt')} width={20} height={20} className="mb-2 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
            <h3 className="font-medium mb-1">{t('home.features.translate.title')}</h3>
            <p className="text-sm text-black/70">{t('home.features.translate.desc')}</p>
            <TranslateSquarePro ariaLabel={t('home.features.translate.alt')} width={512} height={512} className="mt-3 w-full h-auto rounded border ring-1 ring-black/5" />
          </div>
          <div className="group relative border rounded-xl p-3 sm:p-4 bg-white shadow-sm ring-1 ring-black/5 transform-gpu transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:bg-black/[0.02] hover:ring-brand/40">
            <ExportIconPro ariaLabel={t('home.features.export.alt')} width={20} height={20} className="mb-2 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
            <h3 className="font-medium mb-1">{t('home.features.export.title')}</h3>
            <p className="text-sm text-black/70">{t('home.features.export.desc')}</p>
            <ExportSquarePro ariaLabel={t('home.features.export.alt')} width={512} height={512} className="mt-3 w-full h-auto rounded border ring-1 ring-black/5" />
          </div>
        </div>
      </section>

      {/* Galerie d’aperçus */}
      <section className="space-y-3">
        <h2 className="text-xl font-medium">{t('home.gallery.title')}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <ComposeProWide ariaLabel={t('home.gallery.alt.generator')} width={1200} height={675} className="w-full h-auto rounded-xl border shadow-sm ring-1 ring-black/5" />
          <TranslateProWide ariaLabel={t('home.gallery.alt.translation')} width={1200} height={675} className="w-full h-auto rounded-xl border shadow-sm ring-1 ring-black/5" />
          <ExportProWide ariaLabel={t('home.gallery.alt.export')} width={1200} height={675} className="w-full h-auto rounded-xl border shadow-sm ring-1 ring-black/5" />
        </div>
      </section>

      

      {/* Cas d’usage */}
      <section className="space-y-3">
        <h2 className="text-xl font-medium">{t('home.usecases.title')}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="border rounded-xl p-3 sm:p-4 bg-white shadow-sm ring-1 ring-black/5">
            <TerminationProSquare ariaLabel={t('home.usecases.item1.alt')} width={256} height={256} className="w-full h-auto rounded mb-3 border ring-1 ring-black/5" />
            <p className="font-medium">{t('home.usecases.item1.title')}</p>
            <p className="text-sm text-black/70">{t('home.usecases.item1.desc')}</p>
          </div>
          <div className="border rounded-xl p-3 sm:p-4 bg-white shadow-sm ring-1 ring-black/5">
            <ContractProSquare ariaLabel={t('home.usecases.item2.alt')} width={256} height={256} className="w-full h-auto rounded mb-3 border ring-1 ring-black/5" />
            <p className="font-medium">{t('home.usecases.item2.title')}</p>
            <p className="text-sm text-black/70">{t('home.usecases.item2.desc')}</p>
          </div>
          <div className="border rounded-xl p-3 sm:p-4 bg-white shadow-sm ring-1 ring-black/5">
            <CertificateProSquare ariaLabel={t('home.usecases.item3.alt')} width={256} height={256} className="w-full h-auto rounded mb-3 border ring-1 ring-black/5" />
            <p className="font-medium">{t('home.usecases.item3.title')}</p>
            <p className="text-sm text-black/70">{t('home.usecases.item3.desc')}</p>
          </div>
        </div>
        {/* Galerie sous Cas d’usage retirée selon demande */}
      </section>

      {/* Étapes */}
      <section className="space-y-3">
        <h2 className="text-xl font-medium">{t('home.how.title')}</h2>
        <ol className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 list-decimal list-inside">
          <li className="border rounded-xl p-3 sm:p-4 bg-white shadow-sm ring-1 ring-black/5">
            <ComposeIconPro ariaLabel={t('home.how.steps.1.title')} width={64} height={64} className="w-16 h-16 mb-2 rounded border ring-1 ring-black/5" />
            <p className="font-medium">{t('home.how.steps.1.title')}</p>
            <p className="text-sm text-black/70">{t('home.how.steps.1.desc')}</p>
          </li>
          <li className="border rounded-xl p-3 sm:p-4 bg-white shadow-sm ring-1 ring-black/5">
            <TranslateIconPro ariaLabel={t('home.how.steps.2.title')} width={64} height={64} className="w-16 h-16 mb-2 rounded border ring-1 ring-black/5" />
            <p className="font-medium">{t('home.how.steps.2.title')}</p>
            <p className="text-sm text-black/70">{t('home.how.steps.2.desc')}</p>
          </li>
          <li className="border rounded-xl p-3 sm:p-4 bg-white shadow-sm ring-1 ring-black/5">
            <ExportIconPro ariaLabel={t('home.how.steps.3.title')} width={64} height={64} className="w-16 h-16 mb-2 rounded border ring-1 ring-black/5" />
            <p className="font-medium">{t('home.how.steps.3.title')}</p>
            <p className="text-sm text-black/70">{t('home.how.steps.3.desc')}</p>
          </li>
        </ol>
        {/* Galerie spécifique Étapes */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <Step1Wide ariaLabel={t('home.how.steps.1.title')} width={1200} height={675} className="w-full h-auto rounded-xl border shadow-sm ring-1 ring-black/5" />
          <Step2Wide ariaLabel={t('home.how.steps.2.title')} width={1200} height={675} className="w-full h-auto rounded-xl border shadow-sm ring-1 ring-black/5" />
          <Step3Wide ariaLabel={t('home.how.steps.3.title')} width={1200} height={675} className="w-full h-auto rounded-xl border shadow-sm ring-1 ring-black/5" />
        </div>
      </section>

      

      {/* FAQ */}
      <section className="space-y-3">
        <h2 className="text-xl font-medium">{t('home.faq.title')}</h2>
        <div className="space-y-2">
          <details className="border rounded-xl p-3 sm:p-4 bg-white shadow-sm ring-1 ring-black/5">
            <summary className="font-medium cursor-pointer">{t('home.faq.q1')}</summary>
            <p className="text-sm text-black/70 mt-2">{t('home.faq.a1')}</p>
          </details>
          <details className="border rounded-xl p-3 sm:p-4 bg-white shadow-sm ring-1 ring-black/5">
            <summary className="font-medium cursor-pointer">{t('home.faq.q2')}</summary>
            <p className="text-sm text-black/70 mt-2">{t('home.faq.a2')}</p>
          </details>
          <details className="border rounded-xl p-3 sm:p-4 bg-white shadow-sm ring-1 ring-black/5">
            <summary className="font-medium cursor-pointer">{t('home.faq.q3')}</summary>
            <p className="text-sm text-black/70 mt-2">{t('home.faq.a3')}</p>
          </details>
          <details className="border rounded-xl p-3 sm:p-4 bg-white shadow-sm ring-1 ring-black/5">
            <summary className="font-medium cursor-pointer">{t('home.faq.q4')}</summary>
            <p className="text-sm text-black/70 mt-2">{t('home.faq.a4')}</p>
          </details>
        </div>
      </section>

      {/* Accès rapide */}
      <section className="space-y-3">
        <h2 className="text-xl font-medium">{t('home.quick.title')}</h2>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <a href="/documents" className="w-full sm:w-auto rounded px-4 py-2 bg-brand text-white hover:bg-brand/80">{t('home.quick.dashboard')}</a>
          <a href="/tarifs" className="w-full sm:w-auto rounded px-4 py-2 border hover:text-brand">{t('home.quick.compare')}</a>
          <a href="/contact" className="w-full sm:w-auto rounded px-4 py-2 border hover:text-brand">{t('home.quick.contact')}</a>
        </div>
      </section>

      {/* Contenu CMS gérable */}
      <PageContent slug="home" className="mt-8" />

      {/* Note */}
      <section className="text-xs text-black/50">
        <p>{t('home.note.text1')}</p>
        <p>{t('home.note.text2')}</p>
      </section>
    </div>
  );
}

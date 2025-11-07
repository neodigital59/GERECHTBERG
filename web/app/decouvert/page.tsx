'use client';

import Image from "next/image";
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import PageContent from "@/components/PageContent";
// Illustrations vectorielles retirées pour une approche plus professionnelle
// On utilise des visuels clairs depuis /public pour symboliser chaque section

export default function DecouvertPage() {
  const { t } = useTranslation();
  const pricingSubtitle = t('pricing.subtitle');
  
  
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Hero introductif */}
      <header className="space-y-3">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">{t('discover.title')}</h1>
        <p className="text-sm sm:text-base text-black/70 dark:text-white/70">{t('discover.subtitle')}</p>
        <p className="text-sm sm:text-base text-black/80">{t('homeV2.why.tagline')}</p>
        <p className="text-xs sm:text-sm text-black/60">{t('dashboard.comingSoon.note')}</p>
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Link href="/documents/new" className="w-full sm:w-auto rounded-lg px-5 py-2.5 bg-brand text-white font-medium hover:bg-brand/90">{t('homeV2.cta.create')}</Link>
          <Link href="/auth" className="w-full sm:w-auto rounded-lg px-5 py-2.5 border border-brand text-brand font-medium hover:bg-brand/5">{t('homeV2.cta.tryNow')}</Link>
        </div>
      </header>
      {/* Layout avec sommaire sticky */}
      <div className="lg:grid lg:grid-cols-12 lg:gap-6">
        <aside className="hidden lg:block lg:col-span-3">
          <nav className="sticky top-24 p-3 border rounded-xl bg-white shadow-sm text-sm">
            <p className="font-medium mb-2">{t('navigation.title')}</p>
            <ul className="space-y-1">
              <li><a href="#presentation" className="block px-2 py-1 rounded hover:bg-black/5">{t('navigation.discover')}</a></li>
              <li><a href="#rendezvous" className="block px-2 py-1 rounded hover:bg-black/5">{t('navigation.appointments')}</a></li>
              <li><a href="#sections-texte-1" className="block px-2 py-1 rounded hover:bg-black/5">{t('discover.mainCards.title')}</a></li>
              <li><a href="#sections-texte-2" className="block px-2 py-1 rounded hover:bg-black/5">{t('discover.securityCards.title')}</a></li>
            </ul>
          </nav>
        </aside>
        <div className="lg:col-span-9 space-y-8">
      {/* Présentation (1 section image + texte) */}
      <section id="presentation" className="space-y-3 scroll-mt-24">
        <h2 className="text-lg sm:text-xl font-semibold">{t('navigation.discover')}</h2>
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="rounded-xl overflow-hidden border bg-white lg:col-span-2">
            <Image src="/GE.png" alt={t('homeV2.final.logoAlt')} width={384} height={216} sizes="100vw" className="w-full h-auto object-contain" />
          </div>
          <div className="space-y-3 lg:col-span-2">
            <p className="text-sm sm:text-base text-black/70">{t('discover.subtitle')}</p>
            <ul className="text-sm text-black/70 list-disc pl-5 space-y-1">
              <li>{t('discover.mainCards.cards.writing.title')}</li>
              <li>{t('discover.mainCards.cards.export.title')}</li>
              <li>{t('discover.mainCards.cards.multilingual.title')}</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Prise de rendez-vous avec lien de visioconférence */}
      <section id="rendezvous" className="space-y-3 scroll-mt-24">
        <h2 className="text-lg sm:text-xl font-semibold">{t('appointments.subtitle')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <p className="text-sm sm:text-base text-black/70">{t('discover.appointment.intro')}</p>

            <div className="space-y-2">
              <h3 className="text-base font-semibold">{t('discover.appointment.processTitle')}</h3>
              <ol className="list-decimal list-inside text-sm sm:text-base text-black/70 space-y-1">
                <li>{t('discover.appointment.process.1')}</li>
                <li>{t('discover.appointment.process.2')}</li>
                <li>{t('discover.appointment.process.3')}</li>
              </ol>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-semibold">{t('discover.appointment.pointsTitle')}</h3>
              <ul className="list-disc list-inside text-sm sm:text-base text-black/70 space-y-1">
                <li>{t('discover.appointment.points.simplicity')}</li>
                <li>{t('discover.appointment.points.availability')}</li>
                <li>{t('discover.appointment.points.remote')}</li>
                <li>{t('discover.appointment.points.confidentiality')}</li>
              </ul>
            </div>

            <p className="text-xs sm:text-sm text-black/60">{t('discover.appointment.note')}</p>

            <div className="flex gap-3 pt-1">
              <Link href="/rendezvous" className="inline-flex items-center px-4 py-2 rounded-md bg-brand text-white text-sm sm:text-base hover:bg-brand/90">
                {t('appointments.bookNow')}
              </Link>
              <Link href="/rendezvous#infos" className="inline-flex items-center px-4 py-2 rounded-md border text-sm sm:text-base hover:bg-black/5">
                {t('seeMore')}
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <div className="border rounded-xl p-4 bg-white shadow-sm ring-1 ring-black/5">
              <h3 className="text-base font-semibold mb-2">{t('discover.appointment.whyTitle')}</h3>
              <ul className="list-disc list-inside text-sm sm:text-base text-black/70 space-y-1">
                <li>{t('discover.appointment.why.1')}</li>
                <li>{t('discover.appointment.why.2')}</li>
                <li>{t('discover.appointment.why.3')}</li>
              </ul>
            </div>
            <div className="border rounded-xl p-4 bg-white shadow-sm ring-1 ring-black/5">
              <h3 className="text-base font-semibold mb-2">{t('discover.appointment.availabilityTitle')}</h3>
              <p className="text-sm sm:text-base text-black/70">{t('discover.appointment.availabilityDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section texte 1 (sans cartes images) */}
      <section id="sections-texte-1" className="space-y-3 scroll-mt-24">
        <h2 className="text-lg sm:text-xl font-semibold">{t('discover.mainCards.title')}</h2>
        <div className="grid sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="border rounded-xl p-4 bg-white shadow-sm ring-1 ring-black/5">
            <h3 className="font-medium mb-1">{t('discover.mainCards.cards.writing.title')}</h3>
            <p className="text-sm text-black/70">{t('discover.mainCards.cards.writing.desc')}</p>
          </div>
          <div className="border rounded-xl p-4 bg-white shadow-sm ring-1 ring-black/5">
            <h3 className="font-medium mb-1">{t('discover.mainCards.cards.export.title')}</h3>
            <p className="text-sm text-black/70">{t('discover.mainCards.cards.export.desc')}</p>
          </div>
          <div className="border rounded-xl p-4 bg-white shadow-sm ring-1 ring-black/5">
            <h3 className="font-medium mb-1">{t('discover.mainCards.cards.multilingual.title')}</h3>
            <p className="text-sm text-black/70">{t('discover.mainCards.cards.multilingual.desc')}</p>
          </div>
        </div>
      </section>

      {/* Section texte 2 (Sécurité & conformité) */}
      <section id="sections-texte-2" className="space-y-3 scroll-mt-24">
        <h2 className="text-lg sm:text-xl font-semibold">{t('discover.securityCards.title')}</h2>
        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="border rounded-xl p-4 bg-white shadow-sm ring-1 ring-black/5">
            <h3 className="font-medium mb-1">{t('discover.securityCards.cards.dataProtection.title')}</h3>
            <p className="text-sm text-black/70">{t('discover.securityCards.cards.dataProtection.desc')}</p>
          </div>
          <div className="border rounded-xl p-4 bg-white shadow-sm ring-1 ring-black/5">
            <h3 className="font-medium mb-1">{t('discover.securityCards.cards.traceability.title')}</h3>
            <p className="text-sm text-black/70">{t('discover.securityCards.cards.traceability.desc')}</p>
          </div>
          <div className="border rounded-xl p-4 bg-white shadow-sm ring-1 ring-black/5">
            <h3 className="font-medium mb-1">{t('discover.securityCards.cards.availability.title')}</h3>
            <p className="text-sm text-black/70">{t('discover.securityCards.cards.availability.desc')}</p>
          </div>
          <div className="border rounded-xl p-4 bg-white shadow-sm ring-1 ring-black/5">
            <h3 className="font-medium mb-1">{t('discover.securityCards.cards.signature.title')}</h3>
            <p className="text-sm text-black/70">{t('discover.securityCards.cards.signature.desc')}</p>
          </div>
        </div>
      </section>

      {/* Section sécurité doublon retirée (couvert par discover.securityCards) */}

      {/* Fonctionnalités et avantages par offre (sans prix) */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">{t('pricing.title')}</h2>
        {pricingSubtitle && (
          <p className="text-sm text-black/70">{pricingSubtitle}</p>
        )}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="border rounded-xl p-4 bg-white shadow-sm ring-1 ring-black/5">
            <h3 className="font-medium mb-1">{t('pricing.plans.basic.name')}</h3>
            <ul className="text-sm text-black/70 space-y-1.5">
              <li>{t('pricing.cards.basic.items.1')}</li>
              <li>{t('pricing.cards.basic.items.2')}</li>
              <li>{t('pricing.cards.basic.items.3')}</li>
            </ul>
          </div>
          <div className="border rounded-xl p-4 bg-white shadow-sm ring-1 ring-black/5">
            <h3 className="font-medium mb-1">{t('pricing.plans.pro.name')}</h3>
            <ul className="text-sm text-black/70 space-y-1.5">
              <li>{t('pricing.cards.pro.items.1')}</li>
              <li>{t('pricing.cards.pro.items.2')}</li>
              <li>{t('pricing.cards.pro.items.3')}</li>
            </ul>
          </div>
          <div className="border rounded-xl p-4 bg-white shadow-sm ring-1 ring-black/5">
            <h3 className="font-medium mb-1">{t('pricing.plans.enterprise.name')}</h3>
            <ul className="text-sm text-black/70 space-y-1.5">
              <li>{t('pricing.cards.enterprise.items.1')}</li>
              <li>{t('pricing.cards.enterprise.items.2')}</li>
              <li>{t('pricing.cards.enterprise.items.3')}</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Résultats clés */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">{t('discover.results.title')}</h2>
        <ul className="list-disc pl-5 space-y-1.5 text-sm text-black/70">
          <li>{t('discover.results.items.1')}</li>
          <li>{t('discover.results.items.2')}</li>
          <li>{t('discover.results.items.3')}</li>
          <li>{t('discover.results.items.4')}</li>
        </ul>
      </section>

      {/* Fonctionnalités détaillées (sans prix) */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">{t('discover.detailed.title')}</h2>
        <div className="space-y-2 text-sm text-black/70">
          <p>{t('discover.detailed.items.generation')}</p>
          <p>{t('discover.detailed.items.multilangVsAdvanced')}</p>
          <p>{t('discover.detailed.items.exportComplete')}</p>
          <p>{t('discover.detailed.items.priority')}</p>
          <p>{t('discover.detailed.items.solutions')}</p>
        </div>
      </section>

      {/* Séance Découverte: 4 étapes */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">{t('discover.session.title')}</h2>
        <ol className="list-decimal pl-5 space-y-1.5 text-sm text-black/70">
          <li>{t('discover.session.steps.1')}</li>
          <li>{t('discover.session.steps.2')}</li>
          <li>{t('discover.session.steps.3')}</li>
          <li>{t('discover.session.steps.4')}</li>
        </ol>
      </section>

      {/* Avantages clients */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">{t('discover.benefits.title')}</h2>
        <ul className="list-disc pl-5 space-y-1.5 text-sm text-black/70">
          <li>{t('discover.benefits.items.1')}</li>
          <li>{t('discover.benefits.items.2')}</li>
        </ul>
      </section>

      {/* Confiance et réassurance */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">{t('discover.trust.title')}</h2>
        <ul className="list-disc pl-5 space-y-1.5 text-sm text-black/70">
          <li>{t('discover.trust.items.1')}</li>
          <li>{t('discover.trust.items.2')}</li>
          <li>{t('discover.trust.items.3')}</li>
          <li>{t('discover.trust.items.4')}</li>
        </ul>
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


      <section className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
        <Link href="/rendezvous" className="w-full sm:flex-1 bg-brand text-white px-6 py-3 rounded-lg text-center font-medium hover:bg-brand/90 transition-colors">
          {t('appointments.bookNow')}
        </Link>
        <Link href="/contact" className="w-full sm:flex-1 border border-brand text-brand px-6 py-3 rounded-lg text-center font-medium hover:bg-brand/5 transition-colors">
          {t('navigation.contact')}
        </Link>
      </section>

      <footer className="text-xs text-black/50 pt-4 border-t">
        {t('discover.disclaimer')}
      </footer>

      {/* Contenu CMS gérable */}
      <PageContent slug="decouvert" className="mt-8" />
      </div>{/* fin main */}
      </div>{/* fin grid */}
    </div>
  );
}
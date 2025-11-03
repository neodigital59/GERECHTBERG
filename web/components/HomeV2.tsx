"use client";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";

export default function HomeV2() {
  const { t } = useTranslation();
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-10">
      {/* 2️⃣ Hero Section */}
      <section className="space-y-4">
        <header className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">{t('homeV2.hero.title')}</h1>
          <p className="text-sm sm:text-base text-black/70 dark:text-white/70">{t('homeV2.hero.desc')}</p>
        </header>
        <div className="rounded-xl overflow-hidden border bg-white shadow-sm ring-1 ring-black/5">
          {/* On conserve le visuel Hero existant */}
          <Image src="/asset/Hero2.png" alt={t('homeV2.hero.alt')} width={1200} height={675} priority sizes="100vw" className="w-full h-auto" />
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Link href="/documents" className="w-full sm:w-auto rounded px-4 py-2 bg-brand text-white hover:bg-brand/80">{t('homeV2.cta.create')}</Link>
          <Link href="/decouvert" className="w-full sm:w-auto rounded px-4 py-2 border hover:text-brand">{t('homeV2.cta.discover')}</Link>
        </div>
      </section>

      {/* 3️⃣ Section “Nos services” */}
      <section className="space-y-4">
        <h2 className="text-xl font-medium">{t('homeV2.services.title')}</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Recherche juridique */}
          <div className="group relative overflow-hidden border rounded-xl bg-white shadow-sm ring-1 ring-black/5 hover:shadow-md hover:-translate-y-0.5 transition">
            <div className="flex items-start gap-4 p-4">
              <div className="shrink-0 w-24 h-24 bg-sky-50 rounded-md p-1 flex items-center justify-center">
                <Image src="/im1.jpeg" alt={t('homeV2.services.research.alt')} width={96} height={96} className="w-full h-full rounded-md object-cover" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium mb-1">{t('homeV2.services.research.title')}</h3>
                <p className="text-sm text-black/70">{t('homeV2.services.research.desc')}</p>
                <ul className="mt-2 text-sm text-black/70 list-disc list-inside space-y-1">
                  <li>{t('homeV2.services.research.points.1')}</li>
                  <li>{t('homeV2.services.research.points.2')}</li>
                  <li>{t('homeV2.services.research.points.3')}</li>
                </ul>
                <div className="mt-3">
                  <Link href="/decouvert" className="rounded px-3 py-1.5 border hover:text-brand">{t('homeV2.services.research.cta')}</Link>
                </div>
              </div>
            </div>
          </div>

          {/* Coaching stratégique */}
          <div className="group relative overflow-hidden border rounded-xl bg-white shadow-sm ring-1 ring-black/5 hover:shadow-md hover:-translate-y-0.5 transition">
            <div className="flex items-start gap-4 p-4">
              <div className="shrink-0 w-24 h-24 bg-sky-50 rounded-md p-1 flex items-center justify-center">
                <Image src="/im2.jpeg" alt="Coaching stratégique" width={96} height={96} className="w-full h-full rounded-md object-cover" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium mb-1">Coaching stratégique</h3>
                <p className="text-sm text-black/70">Un accompagnement personnalisé pour comprendre vos démarches et prendre les bonnes décisions.</p>
                <ul className="mt-2 text-sm text-black/70 list-disc list-inside space-y-1">
                  <li>Sessions 30–60 min en ligne</li>
                  <li>Plan d’action concret</li>
                  <li>Suivi par messages</li>
                </ul>
                <div className="mt-3">
                  <Link href="/rendezvous" className="rounded px-3 py-1.5 bg-brand text-white hover:bg-brand/80">Prendre rendez‑vous</Link>
                </div>
              </div>
            </div>
          </div>

          {/* Documents administratifs intelligents */}
          <div className="group relative overflow-hidden border rounded-xl bg-white shadow-sm ring-1 ring-black/5 hover:shadow-md hover:-translate-y-0.5 transition">
              <div className="flex items-start gap-4 p-4">
                <div className="shrink-0 w-24 h-24 bg-sky-50 rounded-md p-1 flex items-center justify-center">
                <Image src="/Redaction.png" alt={t('homeV2.services.documents.alt')} width={96} height={96} className="w-full h-full rounded-md object-cover" />
                </div>
                <div className="flex-1">
                <h3 className="font-medium mb-1">{t('homeV2.services.documents.title')}</h3>
                <p className="text-sm text-black/70">{t('homeV2.services.documents.desc')}</p>
                  <ul className="mt-2 text-sm text-black/70 list-disc list-inside space-y-1">
                  <li>{t('homeV2.services.documents.points.1')}</li>
                  <li>{t('homeV2.services.documents.points.2')}</li>
                  <li>{t('homeV2.services.documents.points.3')}</li>
                  </ul>
                  <div className="mt-3">
                  <Link href="/documents" className="rounded px-3 py-1.5 bg-brand text-white hover:bg-brand/80">{t('homeV2.services.documents.cta')}</Link>
                  </div>
                </div>
              </div>
            </div>

          {/* Traduction multilingue */}
          <div className="group relative overflow-hidden border rounded-xl bg-white shadow-sm ring-1 ring-black/5 hover:shadow-md hover:-translate-y-0.5 transition">
              <div className="flex items-start gap-4 p-4">
                <div className="shrink-0 w-24 h-24 bg-sky-50 rounded-md p-1 flex items-center justify-center">
                <Image src="/Traduction.png" alt={t('homeV2.services.translate.alt')} width={96} height={96} className="w-full h-full rounded-md object-cover" />
                </div>
                <div className="flex-1">
                <h3 className="font-medium mb-1">{t('homeV2.services.translate.title')}</h3>
                <p className="text-sm text-black/70">{t('homeV2.services.translate.desc')}</p>
                  <ul className="mt-2 text-sm text-black/70 list-disc list-inside space-y-1">
                  <li>{t('homeV2.services.translate.points.1')}</li>
                  <li>{t('homeV2.services.translate.points.2')}</li>
                  <li>{t('homeV2.services.translate.points.3')}</li>
                  </ul>
                  <div className="mt-3">
                  <Link href="/documents" className="rounded px-3 py-1.5 border hover:text-brand">{t('homeV2.services.translate.cta')}</Link>
                  </div>
                </div>
              </div>
            </div>
        </div>
      </section>

      {/* 4️⃣ Section “Pourquoi choisir GERECHTBERG ?” */}
      <section className="space-y-4">
        <h2 className="text-xl font-medium">{t('homeV2.why.title')}</h2>
        <div className="rounded-xl overflow-hidden border bg-white shadow-sm ring-1 ring-black/5">
          <Image src="/im1.jpeg" alt={t('homeV2.why.imageAlt')} width={1200} height={400} sizes="100vw" className="w-full h-auto" />
        </div>
        <div className="grid sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="border border-sky-300 rounded-xl p-4 bg-sky-100 dark:bg-sky-900/30 shadow-md ring-1 ring-sky-200">
            <p className="font-medium mb-1">{t('homeV2.why.values.clarity.title')}</p>
            <p className="text-sm text-black/70">{t('homeV2.why.values.clarity.desc')}</p>
          </div>
          <div className="border border-sky-300 rounded-xl p-4 bg-sky-100 dark:bg-sky-900/30 shadow-md ring-1 ring-sky-200">
            <p className="font-medium mb-1">{t('homeV2.why.values.compliance.title')}</p>
            <p className="text-sm text-black/70">{t('homeV2.why.values.compliance.desc')}</p>
          </div>
          <div className="border border-sky-300 rounded-xl p-4 bg-sky-100 dark:bg-sky-900/30 shadow-md ring-1 ring-sky-200">
            <p className="font-medium mb-1">{t('homeV2.why.values.serenity.title')}</p>
            <p className="text-sm text-black/70">{t('homeV2.why.values.serenity.desc')}</p>
          </div>
        </div>
        <p className="text-sm text-black/70">{t('homeV2.why.tagline')}</p>
      </section>

      {/* 5️⃣ Section “Comment ça marche ?” */}
      <section className="space-y-4">
        <h2 className="text-xl font-medium">{t('homeV2.how.title')}</h2>
        <div className="grid sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="border rounded-xl p-4 bg-white shadow-sm ring-1 ring-black/5">
            <Image src="/globe.svg" alt={t('homeV2.how.steps.1.alt')} width={48} height={48} className="mb-2 rounded-md object-contain" />
            <p className="font-medium">{t('homeV2.how.steps.1.title')}</p>
            <p className="text-sm text-black/70">{t('homeV2.how.steps.1.desc')}</p>
          </div>
          <div className="border rounded-xl p-4 bg-white shadow-sm ring-1 ring-black/5">
            <Image src="/file.svg" alt={t('homeV2.how.steps.2.alt')} width={48} height={48} className="mb-2 rounded-md object-contain" />
            <p className="font-medium">{t('homeV2.how.steps.2.title')}</p>
            <p className="text-sm text-black/70">{t('homeV2.how.steps.2.desc')}</p>
          </div>
          <div className="border rounded-xl p-4 bg-white shadow-sm ring-1 ring-black/5">
            <Image src="/window.svg" alt={t('homeV2.how.steps.3.alt')} width={48} height={48} className="mb-2 rounded-md object-contain" />
            <p className="font-medium">{t('homeV2.how.steps.3.title')}</p>
            <p className="text-sm text-black/70">{t('homeV2.how.steps.3.desc')}</p>
          </div>
        </div>
        <div>
          <Link href="/documents" className="rounded px-4 py-2 bg-brand text-white hover:bg-brand/80">{t('homeV2.cta.tryNow')}</Link>
        </div>
      </section>

      {/* 6️⃣ Section “Témoignages / Avis” */}
      <section className="space-y-4 rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-900/20 p-4">
        <h2 className="text-xl font-medium">{t('homeV2.testimonials.title')}</h2>
        <div className="grid sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="border border-rose-300 rounded-xl p-4 bg-white shadow-sm ring-1 ring-rose-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-full p-1 bg-rose-100 ring-1 ring-rose-200">
                <Image src="/avatar-placeholder.svg" alt={t('homeV2.testimonials.avatarAlt')} width={36} height={36} className="rounded-full" />
              </div>
            </div>
            <p className="text-sm font-medium">{t('homeV2.testimonials.items.1.name')}</p>
            <p className="text-sm">{t('homeV2.testimonials.items.1.quote')}</p>
          </div>
          <div className="border border-rose-300 rounded-xl p-4 bg-white shadow-sm ring-1 ring-rose-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-full p-1 bg-rose-100 ring-1 ring-rose-200">
                <Image src="/avatar-placeholder.svg" alt={t('homeV2.testimonials.avatarAlt')} width={36} height={36} className="rounded-full" />
              </div>
            </div>
            <p className="text-sm font-medium">{t('homeV2.testimonials.items.2.name')}</p>
            <p className="text-sm">{t('homeV2.testimonials.items.2.quote')}</p>
          </div>
          <div className="border border-rose-300 rounded-xl p-4 bg-white shadow-sm ring-1 ring-rose-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-full p-1 bg-rose-100 ring-1 ring-rose-200">
                <Image src="/avatar-placeholder.svg" alt={t('homeV2.testimonials.avatarAlt')} width={36} height={36} className="rounded-full" />
              </div>
            </div>
            <p className="text-sm font-medium">{t('homeV2.testimonials.items.3.name')}</p>
            <p className="text-sm">{t('homeV2.testimonials.items.3.quote')}</p>
          </div>
        </div>
      </section>

      {/* 7️⃣ Section “Appel à l’action final” */}
      <section className="space-y-3">
        <h2 className="text-xl font-medium">{t('homeV2.final.title')}</h2>
        <Image src="/Logo-Favicon.png" alt={t('homeV2.final.logoAlt')} width={56} height={56} className="rounded-md" />
        <p className="text-sm text-black/70">{t('homeV2.final.desc')}</p>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Link href="/rendezvous" className="w-full sm:w-auto rounded px-4 py-2 border hover:text-brand">{t('homeV2.final.cta.appointment')}</Link>
          <Link href="/documents" className="w-full sm:w-auto rounded px-4 py-2 bg-brand text-white hover:bg-brand/80">{t('homeV2.final.cta.create')}</Link>
        </div>
      </section>
    </div>
  );
}
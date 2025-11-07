"use client";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "react-i18next";

export default function AccueilV3Page() {
  const { t } = useTranslation();
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6">

      {/* Hero */}
      <section className="relative overflow-hidden rounded-xl border bg-gradient-to-r from-emerald-50 to-emerald-100">
        <div className="grid lg:grid-cols-2 gap-6 p-6 sm:p-8">
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight">{t('homeV2.hero.title')}</h1>
            <p className="text-sm sm:text-base text-black/70 max-w-xl leading-relaxed break-words">{t('homeV2.hero.desc')}</p>
            <p className="text-xs sm:text-sm text-black/60">{t('discover.features.signature.title')}</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/rendezvous" className="px-5 py-2.5 rounded bg-brand text-white hover:opacity-90">{t("navigation.appointments")}</Link>
              <Link href="/decouvert" className="px-5 py-2.5 rounded border hover:bg-black/5">{t("navigation.discover")}</Link>
            </div>
            <div className="flex items-center gap-4 text-xs sm:text-sm text-black/60">
              <span className="inline-flex items-center gap-2"><Image src="/globe.svg" alt={t('discover.features.multilingual.title')} width={18} height={18} /><span>{t('discover.features.multilingual.title')}</span></span>
              <span className="inline-flex items-center gap-2"><Image src="/file.svg" alt={t('discover.features.export.title')} width={18} height={18} /><span>{t('discover.features.export.title')}</span></span>
              <span className="inline-flex items-center gap-2"><Image src="/avatar-placeholder.svg" alt={t('discover.features.signature.title')} width={18} height={18} /><span>{t('discover.features.signature.title')}</span></span>
            </div>
          </div>
          <div className="relative rounded-xl overflow-hidden shadow-sm bg-white aspect-[21/9]">
            <Image
              src="/Hero3.png"
              alt={t('homeV2.hero.alt')}
              fill
              className="object-cover object-center"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
          </div>
        </div>
      </section>

      {/* Section image + texte (remplace le bandeau confiance) */}
      <section className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="order-1 flex flex-col justify-center">
          <h2 className="text-xl sm:text-2xl font-semibold">{t('discover.title')}</h2>
          <p className="mt-2 text-sm sm:text-base text-black/70 leading-relaxed break-words">{t('discover.subtitle')}</p>
          <div className="mt-3 flex gap-2">
            <Link href="/decouvert" className="px-4 py-2 rounded border hover:bg-black/5">{t('homeV2.cta.discover')}</Link>
            <Link href="/documents/new" className="px-4 py-2 rounded bg-brand text-white hover:opacity-90">{t('homeV2.cta.create')}</Link>
          </div>
        </div>
        <div className="order-2 relative rounded-xl overflow-hidden border bg-white aspect-[16/9] lg:aspect-[21/9]">
          <Image src="/asset/Hero2.png" alt={t('homeV2.hero.alt')} fill className="object-cover object-center" />
        </div>
      </section>


      {/* Cartes deux par deux — fonctionnalités principales */}
      <section className="mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-5">
          {[
            {
              title: t('discover.features.writing.title'),
              img: "/redaction assiste.png",
              desc: t('discover.features.writing.description'),
            },
            {
              title: t('discover.features.versions.title'),
              img: "/gestion des versions.png",
              desc: t('discover.features.versions.description'),
            },
            {
              title: t('discover.features.export.title'),
              img: "/Partage et Export.png",
              desc: t('discover.features.export.description'),
            },
            {
              title: t('discover.features.multilingual.title'),
              img: "/traduction avance.png",
              desc: t('discover.features.multilingual.description'),
            },
            {
              title: t('discover.features.sharing.title'),
              img: "/collaboration securise.png",
              desc: t('discover.features.sharing.description'),
            },
          ].map((card, i) => (
            <div
              key={i}
              className="group relative overflow-hidden border rounded-xl bg-white shadow-sm ring-1 ring-black/5 hover:shadow-md hover:-translate-y-0.5 transition"
            >
              <div className="flex items-start gap-4 p-4">
                <div className="shrink-0 w-14 h-14 bg-emerald-50 rounded-md p-1 flex items-center justify-center">
                  <Image
                    src={card.img}
                    alt={card.title}
                    width={56}
                    height={56}
                    className="w-full h-full rounded-md object-contain"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium mb-1 text-sm sm:text-base">{card.title}</h3>
                  <p className="text-sm sm:text-base text-black/70 leading-relaxed break-words">{card.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>



      {/* Sections alternées image + texte */}
      <section className="mt-8 grid lg:grid-cols-2 gap-6">
        <div className="order-2 lg:order-1 flex flex-col justify-center">
          <h2 className="text-xl sm:text-2xl font-semibold">{t('discover.features.writing.title')}</h2>
          <p className="mt-2 text-sm sm:text-base text-black/70 leading-relaxed break-words">{t('discover.features.writing.description')}</p>
          <div className="mt-3 flex gap-2">
            <Link href="/decouvert" className="px-4 py-2 rounded border hover:bg-black/5">{t('homeV2.cta.discover')}</Link>
            <Link href="/documents/new" className="px-4 py-2 rounded bg-brand text-white hover:opacity-90">{t('homeV2.cta.create')}</Link>
          </div>
        </div>
        <div className="order-1 lg:order-2 relative rounded-xl overflow-hidden border bg-white aspect-[16/9] lg:aspect-[21/9]">
          <Image src="/1.png" alt={t('discover.features.writing.title')} fill className="object-cover object-center" />
        </div>
      </section>

      <section className="mt-8 grid lg:grid-cols-2 gap-6">
        <div className="relative rounded-xl overflow-hidden border bg-white aspect-[16/9] lg:aspect-[21/9]">
          <Image src="/2.png" alt={t('discover.features.export.title')} fill className="object-cover object-center" />
        </div>
        <div className="flex flex-col justify-center">
          <h2 className="text-xl sm:text-2xl font-semibold">{t('discover.features.export.title')}</h2>
          <p className="mt-2 text-sm sm:text-base text-black/70 leading-relaxed break-words">{t('discover.features.export.description')}</p>
          <div className="mt-3 flex gap-2">
            <Link href="/rendezvous" className="px-4 py-2 rounded bg-brand text-white hover:opacity-90">{t("navigation.appointments")}</Link>
            <Link href="/contact" className="px-4 py-2 rounded border hover:bg-black/5">{t("navigation.contact")}</Link>
          </div>
        </div>
      </section>

      {/* Bandeau CTA */}
      <section className="mt-6 rounded-xl p-6 bg-gradient-to-r from-emerald-100 to-emerald-200 border">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="font-medium">{t('homeV2.cta.tryNow')}</p>
            <p className="text-sm text-black/70">{t('appointments.subtitle')}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/rendezvous" className="px-4 py-2 rounded bg-brand text-white hover:opacity-90">{t("navigation.appointments")}</Link>
            <Link href="/contact" className="px-4 py-2 rounded border hover:bg-black/5">{t("navigation.contact")}</Link>
          </div>
        </div>
      </section>

      {/* Second CTA full-width */}
      <section className="mt-6 rounded-xl p-8 bg-gradient-to-b from-emerald-200 to-emerald-300 border blink-green">
        <div className="text-center space-y-3">
          <h2 className="text-2xl font-semibold">{t('homeV2.cta.tryNow')}</h2>
          <p className="text-sm text-black/70">{t('homeV2.hero.desc')}</p>
          <div className="flex justify-center gap-2">
            <Link href="/documents/new" className="px-5 py-2.5 rounded bg-brand text-white hover:opacity-90">{t('homeV2.cta.create')}</Link>
            <Link href="/decouvert" className="px-5 py-2.5 rounded border hover:bg-black/5">{t('homeV2.cta.discover')}</Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mt-8 border rounded-xl bg-white p-4">
        <h2 className="text-xl font-semibold mb-3">{t('faq.title')}</h2>
        <div className="space-y-2">
          <details className="group border rounded-lg p-3">
            <summary className="font-medium cursor-pointer">{t('home.faq.q4')}</summary>
            <p className="mt-2 text-sm text-black/70">{t('home.faq.a4')}</p>
          </details>
          <details className="group border rounded-lg p-3">
            <summary className="font-medium cursor-pointer">{t('home.faq.q3')}</summary>
            <p className="mt-2 text-sm text-black/70">{t('home.faq.a3')}</p>
          </details>
          <details className="group border rounded-lg p-3">
            <summary className="font-medium cursor-pointer">{t('home.faq.q2')}</summary>
            <p className="mt-2 text-sm text-black/70">{t('home.faq.a2')}</p>
          </details>
        </div>
      </section>

      {/* Footer global FooterV3 géré par layout.tsx */}
    </div>
  );
}
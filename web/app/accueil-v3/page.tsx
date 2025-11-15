"use client";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AccueilV3Page() {
  const { t } = useTranslation();
  const [firstName, setFirstName] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await supabase?.auth.getUser();
        const user = res?.data?.user;
        const meta = user?.user_metadata ?? {};
        const rawName =
          meta.first_name ||
          meta.given_name ||
          meta.name ||
          meta.full_name ||
          null;
        let fn = rawName as string | null;
        if (!fn && user?.email) {
          const handle = String(user.email).split("@")[0];
          fn = handle ? handle.charAt(0).toUpperCase() + handle.slice(1) : null;
        }
        if (mounted) setFirstName(fn);
      } catch (e) {
        // ignore errors, keep greeting generic
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Hero Offres gratuites (placé tout en haut) */}
      <section className="relative mb-8 rounded-xl bg-brand text-white shadow-sm ring-1 ring-black/5">
        <div className="px-5 py-6 sm:px-8 sm:py-10">
          <div className="max-w-3xl">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
              {t('homeV3.freeHero.greeting', { defaultValue: `Bienvenue sur GERECHTBERG${firstName ? ", " + firstName : ""} !` })}
            </h1>
            <p className="mt-2 text-sm sm:text-base opacity-90 leading-relaxed">
              {t('homeV3.freeHero.simplify', { defaultValue: "Vos démarches administratives en Allemagne et en Europe deviennent simples et claires." })}
            </p>

            <ul className="mt-4 space-y-2 text-sm sm:text-base opacity-90 leading-relaxed">
              <li>✅ {t('homeV3.freeHero.point1', { defaultValue: "Documents officiels rédigés et traduits" })}</li>
              <li>✅ {t('homeV3.freeHero.point2', { defaultValue: "Conformité garantie" })}</li>
              <li>✅ {t('homeV3.freeHero.point3', { defaultValue: "Experts en droit à votre écoute" })}</li>
            </ul>

            <div className="mt-4 text-sm sm:text-base opacity-90 leading-relaxed">
              <p className="font-medium">
                {t('homeV3.freeHero.start', { defaultValue: "Commencez maintenant :" })}
              </p>
              <p>{t('homeV3.freeHero.option1', { defaultValue: "Parlez à un expert" })}</p>
              <p>{t('homeV3.freeHero.option2', { defaultValue: "Ou laissez Greta vous guider pas à pas" })}</p>
            </div>
          </div>
          {/* Image illustrative (aucun bouton d’action dans le hero) */}
          <div className="mt-5">
            <Image
              src="/Hero3.png"
              alt={t('homeV3.freeHero.imageAlt', { defaultValue: "Illustration de l'offre gratuite" })}
              width={1200}
              height={480}
              priority
              className="w-full h-auto rounded-lg shadow-sm ring-1 ring-black/10"
            />
          </div>
          <p className="mt-3 text-xs sm:text-sm opacity-85">
            {t('homeV3.freeHero.note', { defaultValue: 'Preuve de résidence peut être requise.' })}
          </p>
        </div>
      </section>

      {/* Deux cartes d’actions, sans mini-formulaire */}
      <section className="grid sm:grid-cols-2 gap-6">
        {/* Carte documents */}
        <div className="relative bg-white border rounded-xl p-6 shadow-sm ring-1 ring-black/5 animate-card-attention">
          <div className="flex items-center gap-3 mb-3">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-blue-50">
              <Image src="/file.svg" alt="Document" width={22} height={22} />
            </span>
            <span className="text-sm text-black/60">{t('actions.cards.documents.badge', { defaultValue: 'Documents' })}</span>
          </div>
          <h2 className="text-lg font-medium mb-2">{t('actions.cards.documents.title', { defaultValue: 'Generate a Document' })}</h2>
          <p className="text-sm text-black/70 mb-4">{t('actions.cards.documents.desc', { defaultValue: 'Create, translate, and export official documents with AI.' })}</p>
          <Link href="/documents/new" className="inline-flex items-center justify-center rounded px-4 py-2.5 bg-brand text-white hover:bg-brand/90">
            {t('homeV3.cta.generate', { defaultValue: 'Start Generating' })}
          </Link>
        </div>

        {/* Carte rendez-vous */}
        <div className="relative bg-white border rounded-xl p-6 shadow-sm ring-1 ring-black/5 animate-card-attention anim-delay-1200ms">
          <div className="flex items-center gap-3 mb-3">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-blue-50">
              <Image src="/window.svg" alt="Expert" width={22} height={22} />
            </span>
            <span className="text-sm text-black/60">{t('actions.cards.appointment.badge', { defaultValue: 'Coaching' })}</span>
          </div>
          <h2 className="text-lg font-medium mb-2">{t('actions.cards.appointment.title', { defaultValue: 'Book an Expert' })}</h2>
          <p className="text-sm text-black/70 mb-4">{t('actions.cards.appointment.desc', { defaultValue: 'Schedule a 30-minute consultation with a legal expert.' })}</p>
          <Link href="/rendezvous" className="inline-flex items-center justify-center rounded px-4 py-2.5 bg-brand text-white hover:bg-brand/90">
            {t('homeV3.cta.book', { defaultValue: 'Book Now' })}
          </Link>
        </div>
      </section>
    </div>
  );
}

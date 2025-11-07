"use client";
import { useTranslation } from "react-i18next";

export default function MentionsLegalesPage() {
  const { t } = useTranslation();
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          {t("legalPages.imprint.title", { defaultValue: "Mentions légales" })}
        </h1>
        <p className="text-sm sm:text-base text-black/70">
          {t("legalPages.imprint.subtitle", { defaultValue: "Informations réglementaires et éditeur du site." })}
        </p>
      </header>

      <section className="border rounded-xl bg-white p-4 shadow-sm space-y-3">
        <p className="text-sm text-black/80">
          {t("legalPages.imprint.editor", { defaultValue: "Éditeur: GERECHTBERG." })}
        </p>
        <p className="text-sm text-black/80">
          {t("legalPages.imprint.address", { defaultValue: "Adresse: Germany, Berlin." })}
        </p>
        <p className="text-sm text-black/80">
          {t("legalPages.imprint.contact", { defaultValue: "Contact: contact.gerechtberg.com — WhatsApp: +49 176 40416570." })}
        </p>
        <p className="text-sm text-black/80">
          {t("legalPages.imprint.hosting", { defaultValue: "Hébergement: Vercel (UE/US), avec CDN." })}
        </p>
      </section>

      <section className="border rounded-xl bg-white p-4 shadow-sm space-y-2">
        <h2 className="font-medium">
          {t("legalPages.imprint.liabilityTitle", { defaultValue: "Responsabilité" })}
        </h2>
        <p className="text-sm text-black/80">
          {t("legalPages.imprint.liabilityText", { defaultValue: "Les informations présentées sont fournies à titre indicatif. GERECHTBERG ne saurait être tenue responsable des dommages directs ou indirects résultant de l’utilisation du site." })}
        </p>
      </section>
    </div>
  );
}
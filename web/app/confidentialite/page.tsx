"use client";
import { useTranslation } from "react-i18next";

export default function ConfidentialitePage() {
  const { t } = useTranslation();
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          {t("legalPages.privacy.title", { defaultValue: "Confidentialité" })}
        </h1>
        <p className="text-sm sm:text-base text-black/70">
          {t("legalPages.privacy.subtitle", { defaultValue: "Politique de protection des données personnelles." })}
        </p>
      </header>

      <section className="border rounded-xl bg-white p-4 shadow-sm space-y-3">
        <h2 className="font-medium">
          {t("legalPages.privacy.collectedTitle", { defaultValue: "Données collectées" })}
        </h2>
        <p className="text-sm text-black/80">
          {t("legalPages.privacy.collectedText", { defaultValue: "Nous collectons les données nécessaires au fonctionnement du service (compte, documents, préférences). Les données sont conservées de manière sécurisée." })}
        </p>
        <h2 className="font-medium">
          {t("legalPages.privacy.purposesTitle", { defaultValue: "Finalités" })}
        </h2>
        <p className="text-sm text-black/80">
          {t("legalPages.privacy.purposesText", { defaultValue: "Rédaction assistée, traduction, gestion de versions, partage et export." })}
        </p>
        <h2 className="font-medium">
          {t("legalPages.privacy.rightsTitle", { defaultValue: "Vos droits" })}
        </h2>
        <p className="text-sm text-black/80">
          {t("legalPages.privacy.rightsText", { defaultValue: "Vous pouvez exercer vos droits (accès, rectification, suppression) en nous contactant à contact.gerechtberg.com." })}
        </p>
      </section>

      <section className="border rounded-xl bg-white p-4 shadow-sm space-y-2">
        <h2 className="font-medium">
          {t("legalPages.privacy.securityTitle", { defaultValue: "Sécurité" })}
        </h2>
        <p className="text-sm text-black/80">
          {t("legalPages.privacy.securityText", { defaultValue: "Chiffrement en transit (TLS) et au repos, politiques d’accès strictes et journalisation des opérations critiques." })}
        </p>
      </section>
    </div>
  );
}
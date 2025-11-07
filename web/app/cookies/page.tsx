"use client";
import { useTranslation } from "react-i18next";

export default function CookiesPage() {
  const { t } = useTranslation();
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          {t("legalPages.cookies.title", { defaultValue: "Cookies" })}
        </h1>
        <p className="text-sm sm:text-base text-black/70">
          {t("legalPages.cookies.subtitle", { defaultValue: "Informations sur l’utilisation des cookies et technologies similaires." })}
        </p>
      </header>

      <section className="border rounded-xl bg-white p-4 shadow-sm space-y-3">
        <h2 className="font-medium">
          {t("legalPages.cookies.typesTitle", { defaultValue: "Types de cookies" })}
        </h2>
        <ul className="list-disc pl-5 text-sm text-black/80 space-y-1.5">
          <li>
            {t("legalPages.cookies.types.necessary", { defaultValue: "Cookies nécessaires: fonctionnement de base du site." })}
          </li>
          <li>
            {t("legalPages.cookies.types.performance", { defaultValue: "Cookies de performance: amélioration et mesure d’audience." })}
          </li>
          <li>
            {t("legalPages.cookies.types.functionality", { defaultValue: "Cookies de fonctionnalité: préférences et personnalisation." })}
          </li>
        </ul>
      </section>

      <section className="border rounded-xl bg-white p-4 shadow-sm space-y-2">
        <h2 className="font-medium">
          {t("legalPages.cookies.manageTitle", { defaultValue: "Gestion" })}
        </h2>
        <p className="text-sm text-black/80">
          {t("legalPages.cookies.manageText", { defaultValue: "Vous pouvez gérer vos préférences de cookies depuis les paramètres de votre navigateur. Pour toute question, contactez contact.gerechtberg.com." })}
        </p>
      </section>
    </div>
  );
}
"use client";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export default function CookiesPage() {
  const { t } = useTranslation();
  const [performance, setPerformance] = useState(true);
  const [functionality, setFunctionality] = useState(true);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    try {
      const status = localStorage.getItem("cookieConsent");
      const raw = localStorage.getItem("cookieConsentSettings");
      if (raw) {
        const parsed = JSON.parse(raw);
        setPerformance(Boolean(parsed.performance));
        setFunctionality(Boolean(parsed.functionality));
      } else if (status === "rejected") {
        setPerformance(false);
        setFunctionality(false);
      } else {
        // accepted or no choice yet: default to enabled
        setPerformance(true);
        setFunctionality(true);
      }
    } catch {
      // keep defaults
    }
  }, []);

  const savePreferences = () => {
    try {
      localStorage.setItem(
        "cookieConsentSettings",
        JSON.stringify({ performance, functionality })
      );
      localStorage.setItem("cookieConsent", "custom");
      setStatusMsg(
        t("cookiePrefs.saved", { defaultValue: "Préférences enregistrées." })
      );
    } catch {
      setStatusMsg(
        t("cookiePrefs.error", { defaultValue: "Impossible d’enregistrer les préférences." })
      );
    }
  };

  const resetPreferences = () => {
    try {
      localStorage.removeItem("cookieConsentSettings");
      localStorage.setItem("cookieConsent", "rejected");
      setPerformance(false);
      setFunctionality(false);
      setStatusMsg(
        t("cookiePrefs.reset", { defaultValue: "Préférences réinitialisées." })
      );
    } catch {
      setStatusMsg(
        t("cookiePrefs.error", { defaultValue: "Impossible d’enregistrer les préférences." })
      );
    }
  };

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

      <section className="border rounded-xl bg-white p-4 shadow-sm space-y-3">
        <h2 className="font-medium">
          {t("cookiePrefs.title", { defaultValue: "Gérer les préférences" })}
        </h2>
        <p className="text-sm text-black/80">
          {t("cookiePrefs.desc", { defaultValue: "Activez ou désactivez les cookies non nécessaires ci‑dessous." })}
        </p>
        <div className="space-y-2 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={performance}
              onChange={(e) => setPerformance(e.target.checked)}
            />
            {t("legalPages.cookies.types.performance", { defaultValue: "Cookies de performance: amélioration et mesure d’audience." })}
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={functionality}
              onChange={(e) => setFunctionality(e.target.checked)}
            />
            {t("legalPages.cookies.types.functionality", { defaultValue: "Cookies de fonctionnalité: préférences et personnalisation." })}
          </label>
        </div>
        <div className="flex flex-wrap gap-2 pt-2">
          <button
            type="button"
            onClick={savePreferences}
            className="px-4 py-2 rounded bg-brand text-white hover:bg-brand/80"
          >
            {t("cookiePrefs.save", { defaultValue: "Enregistrer les préférences" })}
          </button>
          <button
            type="button"
            onClick={resetPreferences}
            className="px-4 py-2 rounded border hover:bg-black/5"
          >
            {t("cookiePrefs.reset", { defaultValue: "Réinitialiser" })}
          </button>
          {statusMsg && (
            <span className="text-sm text-black/70 self-center">
              {statusMsg}
            </span>
          )}
        </div>
      </section>
    </div>
  );
}
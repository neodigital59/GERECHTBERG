"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

export default function CookieConsentBanner() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem("cookieConsent");
      if (!v) setVisible(true);
    } catch {
      // If localStorage not accessible, show banner
      setVisible(true);
    }
  }, []);

  const acceptAll = () => {
    try { localStorage.setItem("cookieConsent", "accepted"); } catch {}
    setVisible(false);
  };

  const rejectNonNecessary = () => {
    try { localStorage.setItem("cookieConsent", "rejected"); } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <div className="mx-auto max-w-4xl rounded-xl border bg-white p-4 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="font-medium">
              {t("cookieBanner.title", { defaultValue: "Nous utilisons des cookies" })}
            </p>
            <p className="text-sm text-black/70">
              {t("cookieBanner.text", { defaultValue: "Nous utilisons des cookies nécessaires et, avec votre consentement, d’autres pour améliorer l’expérience." })}
              {" "}
              <Link href="/cookies" className="text-brand hover:underline">
                {t("cookieBanner.linkLabel", { defaultValue: "En savoir plus" })}
              </Link>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="px-4 py-2 rounded bg-brand text-white hover:opacity-90"
              onClick={acceptAll}
            >
              {t("cookieBanner.accept", { defaultValue: "Tout accepter" })}
            </button>
            <button
              className="px-4 py-2 rounded border hover:bg-black/5"
              onClick={rejectNonNecessary}
            >
              {t("cookieBanner.reject", { defaultValue: "Refuser les non nécessaires" })}
            </button>
            <Link
              href="/cookies"
              className="px-4 py-2 rounded border hover:bg-black/5"
            >
              {t("cookieBanner.manage", { defaultValue: "Gérer les préférences" })}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
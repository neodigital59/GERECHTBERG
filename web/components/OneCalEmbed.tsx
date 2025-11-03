"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

type OneCalEmbedProps = {
  bookingUrl?: string;
  className?: string;
};

export default function OneCalEmbed({ bookingUrl, className }: OneCalEmbedProps) {
  const { t } = useTranslation();
  const enabledSetting = (process.env.NEXT_PUBLIC_ONECAL_ENABLED || "true").toString().toLowerCase();
  const isEnabled = !(enabledSetting === "false" || enabledSetting === "0" || enabledSetting === "off");
  if (!isEnabled) {
    // Section OneCal temporairement masquée via configuration
    return null;
  }
  const envUrl = process.env.NEXT_PUBLIC_ONECAL_URL;
  const url =
    bookingUrl ||
    envUrl ||
    "https://app.onecal.io/b/GERECHTBERG/r-duisez-votre-stress-et-vos-frais-d-avocat-coaching-juridique-strat-gique";

  const [loaded, setLoaded] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const frameRef = useRef<HTMLIFrameElement | null>(null);

  function openInApp() {
    setBlocked(false);
    try {
      const el = frameRef.current;
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        el.focus();
      }
    } catch {}
  }

  // Si l'iframe ne se charge pas après un délai, proposer la sortie externe
  useEffect(() => {
    const id = setTimeout(() => {
      if (!loaded) setBlocked(true);
    }, 5000);
    return () => clearTimeout(id);
  }, [loaded]);

  return (
    <div className={className || "border rounded-xl bg-white shadow-sm"}>
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div>
          <h2 className="text-lg font-medium">{t("appointments.title")}</h2>
          <p className="text-sm text-black/70">{t("appointments.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          {!blocked && (
            <button
              onClick={openInApp}
              className="inline-flex items-center gap-2 px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm"
            >
              {/* calendar icon */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v11a3 3 0 0 1-3 3H4a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 2 0v1ZM4 9v9a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V9H4Zm4 3h2v2H8v-2Zm4 0h2v2h-2v-2Zm4 0h2v2h-2v-2ZM8 16h2v2H8v-2Zm4 0h2v2h-2v-2Zm4 0h2v2h-2v-2Z" />
              </svg>
              {t("appointments.openInApp")}
            </button>
          )}
          <Link href="/documents" className="px-3 py-2 rounded border hover:bg-black/5 text-sm">
            {t("appointments.backToApp")}
          </Link>
        </div>
      </div>

      <div className="relative">
        {!loaded && !blocked && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-black/70">
            {t("appointments.loading")}
          </div>
        )}
        {blocked ? (
          <div className="p-4">
            <p className="text-sm text-black/70 mb-3">{t("appointments.fallbackText")}</p>
            <button
              onClick={() => { setBlocked(false); setLoaded(false); }}
              className="inline-flex items-center px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              {t("appointments.openInApp")}
            </button>
          </div>
        ) : (
          <iframe
            title="OneCal embed"
            src={url}
            className="w-full h-[720px] sm:h-[800px] rounded-b-xl"
            id="onecal-embed"
            ref={frameRef}
            onLoad={() => setLoaded(true)}
            onError={() => setBlocked(true)}
            loading="lazy"
          />
        )}
      </div>
    </div>
  );
}
"use client";

import { useTranslation } from "react-i18next";

export default function HeaderNav() {
  const { t } = useTranslation();
  return (
    <nav className="hidden sm:flex items-center gap-3 text-sm whitespace-nowrap" suppressHydrationWarning>
      <a className="hover:text-brand" href="/decouvert">
        {t("navigation.discover")}
      </a>
      <a className="hover:text-brand" href="/tarifs">
        {t("navigation.pricing")}
      </a>
      <a className="hover:text-brand" href="/contact">
        {t("navigation.contact")}
      </a>
      <a className="hover:text-brand" href="/rendezvous">
        {t("navigation.appointments")}
      </a>
    </nav>
  );
}
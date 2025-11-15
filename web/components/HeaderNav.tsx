"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";

export default function HeaderNav() {
  const { t } = useTranslation();
  return (
    <nav className="hidden sm:flex items-center gap-3 text-sm whitespace-nowrap" suppressHydrationWarning>
      <Link className="hover:text-brand" href="/documents/new">
        {t("navigation.document")}
      </Link>
      <Link className="hover:text-brand" href="/rendezvous">
        {t("navigation.appointments")}
      </Link>
      <Link className="hover:text-brand" href="/tarifs">
        {t("navigation.pricing")}
      </Link>
      <Link className="hover:text-brand" href="/contact">
        {t("navigation.contact")}
      </Link>
    </nav>
  );
}
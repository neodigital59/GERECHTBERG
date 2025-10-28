"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

export default function MobileNav() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:hidden" suppressHydrationWarning>
      <button
        aria-label="Menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="px-3 py-2 border rounded text-sm"
      >
        {open ? "Fermer" : "Menu"}
      </button>
      {open && (
        <div className="mt-2 border rounded bg-white shadow-sm dark:bg-black/20">
          <nav className="flex flex-col">
            <Link className="px-4 py-3 border-b hover:text-brand" href="/decouvert">
              {t("navigation.discover")}
            </Link>
            <Link className="px-4 py-3 border-b hover:text-brand" href="/tarifs">
              {t("navigation.pricing")}
            </Link>
            <Link className="px-4 py-3 border-b hover:text-brand" href="/contact">
              {t("navigation.contact")}
            </Link>
            <Link className="px-4 py-3 hover:text-brand" href="/rendezvous">
              {t("navigation.appointments")}
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
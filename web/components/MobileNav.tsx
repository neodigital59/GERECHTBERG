"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";

export default function MobileNav() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Lock body scroll when menu is open
  useEffect(() => {
    try {
      document.body.style.overflow = open ? "hidden" : "";
    } catch {}
    return () => {
      try { document.body.style.overflow = ""; } catch {}
    };
  }, [open]);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="sm:hidden" suppressHydrationWarning>
      <button
        aria-label={t('mobile.menu', 'Menu')}
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full p-2.5 border bg-white shadow-sm text-sm hover:bg-black/5"
      >
        <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="opacity-80">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
        <span className="sr-only sm:not-sr-only">{t('mobile.menu', 'Menu')}</span>
      </button>

      {mounted && createPortal(
        <div className={`fixed inset-0 z-[60] transition-opacity ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} aria-modal="true" role="dialog">
          <button
            aria-label="Close overlay"
            className="absolute inset-0 bg-black/20"
            onClick={() => setOpen(false)}
          />
          <div className={`absolute right-0 top-0 h-full w-[92%] max-w-[360px] bg-white dark:bg-neutral-900 shadow-xl z-[70] border-l rounded-l-xl transform transition-transform duration-300 ease-out ${open ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <span className="font-medium">GERECHTBERG</span>
              <button
                aria-label={t('mobile.close', 'Fermer')}
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-2 px-2 py-1 rounded hover:bg-black/5"
              >
                <span aria-hidden>✕</span>
                <span className="text-sm">{t('mobile.close', 'Fermer')}</span>
              </button>
            </div>
            <nav className="flex flex-col py-2 overflow-y-auto">
              <Link className="px-4 py-3 text-base hover:bg-black/5 flex items-center gap-3" href="/decouvert" onClick={() => setOpen(false)}>
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="opacity-80"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3-3"/></svg>
                <span>{t("navigation.discover")}</span>
              </Link>
              <Link className="px-4 py-3 text-base hover:bg-black/5 flex items-center gap-3" href="/tarifs" onClick={() => setOpen(false)}>
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="opacity-80"><path d="M4 7h10l6 6-7 7-6-6V7z"/><path d="M8 7V3"/></svg>
                <span>{t("navigation.pricing")}</span>
              </Link>
              <Link className="px-4 py-3 text-base hover:bg-black/5 flex items-center gap-3" href="/contact" onClick={() => setOpen(false)}>
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="opacity-80"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>
                <span>{t("navigation.contact")}</span>
              </Link>
              <Link className="px-4 py-3 text-base hover:bg-black/5 flex items-center gap-3" href="/rendezvous" onClick={() => setOpen(false)}>
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="opacity-80"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/></svg>
                <span>{t("navigation.appointments")}</span>
              </Link>
            </nav>
            <div className="mt-auto border-t px-4 py-3">
              <div className="flex items-center justify-between">
                <LanguageSwitcher />
                <Link href="/documents" onClick={() => setOpen(false)} className="px-3 py-2 rounded bg-brand text-white hover:bg-brand/80 text-sm">
                  {t('navigation.dashboard')}
                </Link>
              </div>
            </div>
          </div>
        </div>, document.body)
      }
    </div>
  );
}
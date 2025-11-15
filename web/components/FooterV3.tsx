"use client";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "react-i18next";

export default function FooterV3() {
  const { t } = useTranslation();
  return (
    <footer className="mt-8 bg-gray-100 border-t border-black/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-6 text-xs sm:text-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-black/60">{t("footer.copyright", { year: new Date().getUTCFullYear(), defaultValue: `© ${new Date().getUTCFullYear()} GERECHTBERG` })}</p>
          <nav className="flex flex-wrap items-center gap-3">
            <Link href="/mentions-legales" className="hover:text-brand">{t("footer.legal.imprint", { defaultValue: "Mentions légales" })}</Link>
            <Link href="/contact" className="hover:text-brand">{t("navigation.contact", { defaultValue: "Contact" })}</Link>
            <Link href="/confidentialite" className="hover:text-brand">{t("footer.legal.privacy", { defaultValue: "Confidentialité" })}</Link>
            <a href="mailto:contact@gerechtberg.com" className="hover:text-brand">contact@gerechtberg.com</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
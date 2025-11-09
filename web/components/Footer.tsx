"use client";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="mt-10 border-t border-black/10 dark:border-white/10 bg-gray-100">
      <div className="max-w-5xl mx-auto px-3 py-6 sm:p-6 text-sm text-black/70">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image src="/logo-large.jpeg" alt={t('footer.logoAlt', { defaultValue: t('homeV2.final.logoAlt') })} width={160} height={90} className="h-10 w-auto rounded" />
            <span className="font-semibold text-lg">GERECHTBERG</span>
          </div>
          <nav className="flex flex-wrap gap-4">
            <Link href="/tarifs" className="hover:text-brand">{t("navigation.pricing")}</Link>
            <Link href="/decouvert" className="hover:text-brand">{t("navigation.discover")}</Link>
            <Link href="/contact" className="hover:text-brand">{t("navigation.contact")}</Link>
            <Link href="/rendezvous" className="hover:text-brand">{t("navigation.appointments")}</Link>
            <Link href="/documents" className="hover:text-brand">{t("navigation.dashboard")}</Link>
          </nav>
        </div>
        {/* Image partenaire GE (réduite) */}
        <div className="mt-3 h-10 sm:h-12 relative">
          <Image
            src="/GE.png"
            alt={t('footer.partnerAlt', { defaultValue: 'GE Partner' })}
            fill
            className="object-contain object-center"
            sizes="(max-width: 640px) 160px, 240px"
            priority
          />
        </div>
        <p className="mt-3 text-xs text-black/50">{t('footer.copyright', { year: new Date().getUTCFullYear(), defaultValue: `© ${new Date().getUTCFullYear()} GERECHTBERG — All rights reserved.` })}</p>
      </div>
    </footer>
  );
}
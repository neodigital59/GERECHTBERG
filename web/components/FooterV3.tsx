"use client";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "react-i18next";

export default function FooterV3() {
  const { t } = useTranslation();
  return (
    <footer className="mt-10 bg-gray-100 border-t border-black/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 text-sm">
        {/* Top: brand + short value prop */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6">
          <div className="flex items-center gap-3">
            <Image src="/logo-large.jpeg" alt={t("footer.logoAlt", { defaultValue: "Logo GERECHTBERG" })} width={160} height={90} className="h-10 w-auto rounded" />
            <div>
              <p className="font-semibold text-lg leading-tight">GERECHTBERG</p>
              <p className="text-black/60">{t("footer.brand.tagline", { defaultValue: "Créer, signer et horodater vos documents facilement." })}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/rendezvous" className="px-3 py-1.5 rounded bg-brand text-white hover:opacity-90">{t("navigation.appointments")}</Link>
            <Link href="/decouvert" className="px-3 py-1.5 rounded border hover:bg-black/5">{t("navigation.discover")}</Link>
          </div>
        </div>

        {/* Columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          <div>
            <p className="font-medium mb-2">{t("footer.columns.discover", { defaultValue: t("navigation.discover") })}</p>
            <ul className="space-y-1 text-black/70">
              <li><Link className="hover:text-brand" href="/decouvert">{t("footer.links.presentation", { defaultValue: "Présentation" })}</Link></li>
              <li><Link className="hover:text-brand" href="/tarifs">{t("navigation.pricing")}</Link></li>
              <li><Link className="hover:text-brand" href="/contact">{t("navigation.contact")}</Link></li>
              <li><Link className="hover:text-brand" href="/rendezvous">{t("navigation.appointments")}</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-2">{t("footer.columns.features", { defaultValue: "Fonctionnalités" })}</p>
            <ul className="space-y-1 text-black/70">
              <li>{t("footer.features.writing", { defaultValue: "Rédaction assistée" })}</li>
              <li>{t("footer.features.signature", { defaultValue: "Signature électronique" })}</li>
              <li>{t("footer.features.versions", { defaultValue: "Gestion des versions" })}</li>
              <li>{t("footer.features.multilingual", { defaultValue: "Multilingue avancé" })}</li>
              <li>{t("footer.features.export", { defaultValue: "Export & partage" })}</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-2">{t("footer.columns.resources", { defaultValue: "Ressources" })}</p>
            <ul className="space-y-1 text-black/70">
              <li><Link className="hover:text-brand" href="/documents">{t("navigation.dashboard")}</Link></li>
              <li><Link className="hover:text-brand" href="/parametres">{t("navigation.settings")}</Link></li>
              <li><Link className="hover:text-brand" href="/">{t("navigation.home")}</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-2">{t("footer.columns.contact", { defaultValue: "Contact" })}</p>
            <ul className="space-y-1 text-black/70">
              <li>{t("footer.contact.email", { email: "contact.gerechtberg.com", defaultValue: "Email: contact.gerechtberg.com" })}</li>
              <li>{t("footer.contact.whatsapp", { number: "+49 176 40416570", defaultValue: "WhatsApp: +49 176 40416570" })}</li>
              <li>{t("footer.contact.address", { city: "Germany, Berlin", defaultValue: "Adresse: Germany, Berlin" })}</li>
            </ul>
          </div>
        </div>

        {/* Image partenaire GE (réduite) */}
        <div className="mt-6 h-10 sm:h-12 relative">
          <Image
            src="/GE.png"
            alt={t("footer.partnerAlt", { defaultValue: "Partenaire GE" })}
            fill
            className="object-contain object-center"
            sizes="(max-width: 640px) 160px, 240px"
            priority
          />
        </div>

        {/* Bottom: legal */}
        <div className="mt-6 pt-6 border-t border-black/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-black/60">
          <p>{t("footer.copyright", { year: new Date().getUTCFullYear(), defaultValue: `© ${new Date().getUTCFullYear()} GERECHTBERG — Tous droits réservés.` })}</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/mentions-legales" className="hover:text-brand">{t("footer.legal.imprint", { defaultValue: "Mentions légales" })}</Link>
            <Link href="/confidentialite" className="hover:text-brand">{t("footer.legal.privacy", { defaultValue: "Confidentialité" })}</Link>
            <Link href="/cookies" className="hover:text-brand">{t("footer.legal.cookies", { defaultValue: "Cookies" })}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
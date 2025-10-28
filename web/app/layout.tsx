import type { Metadata } from "next";
import Link from "next/link";
// Nous évitons l’accès serveur aux cookies pour stabiliser l’hydratation
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthStatus from "@/components/AuthStatus";
import ClientI18nProvider from "@/components/ClientI18nProvider";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import HeaderNav from "@/components/HeaderNav";
import MobileNav from "@/components/MobileNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GERECHTBERG",
  description: "Plateforme intelligente pour lettres et contrats",
};

// Forcer le rendu dynamique car on lit des cookies côté serveur
export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Langue/dir statiques pour éviter un rendu dynamique bloquant
  const initialLang = "fr";
  const initialDir = "ltr";
  return (
    <html lang={initialLang} dir={initialDir}>
      <body suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground font-sans`}>
        <ClientI18nProvider>
          <header className="w-full border-b border-black/10 dark:border-white/15">
            <div className="max-w-5xl mx-auto flex items-center justify-between px-3 py-3 sm:p-4">
              <div className="flex items-center">
                <span className="font-bold text-xl tracking-tight">GERECHTBERG</span>
              </div>
              <div className="flex items-center gap-4">
                {/* Navigation links */}
                <HeaderNav />
                {/* Mobile navigation */}
                <MobileNav />
                {/* Language switcher */}
                <LanguageSwitcher />
              </div>
              <AuthStatus />
            </div>
          </header>
          {children}
          <footer className="mt-10 border-t border-black/10 dark:border-white/10 bg-emerald-100">
            <div className="max-w-5xl mx-auto px-3 py-6 sm:p-6 text-sm text-black/70">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center">
                  <span className="font-semibold text-lg">GERECHTBERG</span>
                </div>
                <nav className="flex flex-wrap gap-4">
                  <Link href="/tarifs" className="hover:text-brand">Tarifs</Link>
                  <Link href="/decouvert" className="hover:text-brand">Découvert</Link>
                  <Link href="/contact" className="hover:text-brand">Contact</Link>
                  <Link href="/rendezvous" className="hover:text-brand">Rendez-vous</Link>
                  <Link href="/documents" className="hover:text-brand">Documents</Link>
                </nav>
              </div>
              <p className="mt-3 text-xs text-black/50">© {new Date().getUTCFullYear()} GERECHTBERG — Tous droits réservés.</p>
            </div>
          </footer>
        </ClientI18nProvider>
      </body>
    </html>
  );
}

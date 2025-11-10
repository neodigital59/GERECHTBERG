import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientI18nProvider from "@/components/ClientI18nProvider";
import FooterV3 from "@/components/FooterV3";
import NavBarV2 from "@/components/NavBarV2";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import ChatWidget from "@/components/ChatWidget";

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
  icons: {
    icon: [
      { url: "/Logo-Favicon.png", type: "image/png", sizes: "32x32" },
      { url: "/Logo-Favicon.png", type: "image/png", sizes: "192x192" },
      { url: "/favicon.ico" }
    ],
    shortcut: "/Logo-Favicon.png",
    apple: "/Logo-Favicon.png",
  },
};

// Forcer le rendu dynamique car on lit des cookies côté serveur
export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Lire la langue initiale depuis le cookie i18next (middleware) ou fallback fr
  const cookieStore = await cookies();
  const cookieLng = cookieStore.get("i18next")?.value?.toLowerCase();
  const supported = new Set(["fr", "en", "de", "ru", "tr", "zh", "es", "it", "pt", "ar", "ja"]);
  const initialLang = cookieLng && supported.has(cookieLng) ? cookieLng : "fr";
  const initialDir = initialLang === "ar" ? "rtl" : "ltr";
  return (
    <html lang={initialLang} dir={initialDir}>
      <head>
        <link rel="icon" href="/Logo-Favicon.png" type="image/png" sizes="32x32" />
        <link rel="icon" href="/Logo-Favicon.png" type="image/png" sizes="192x192" />
        <link rel="shortcut icon" href="/Logo-Favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/Logo-Favicon.png" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground font-sans`}>
        <ClientI18nProvider initialLng={initialLang}>
          <NavBarV2 />
          {children}
          <CookieConsentBanner />
          <FooterV3 />
          <ChatWidget />
        </ClientI18nProvider>
      </body>
    </html>
  );
}

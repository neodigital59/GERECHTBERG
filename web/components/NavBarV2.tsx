"use client";
import Link from "next/link";
import Image from "next/image";
import HeaderNav from "@/components/HeaderNav";
import MobileNav from "@/components/MobileNav";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import AuthStatus from "@/components/AuthStatus";

export default function NavBarV2() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-black/10 dark:border-white/15 bg-emerald-50 dark:bg-emerald-900/20 backdrop-blur supports-[backdrop-filter]:bg-emerald-50/80">
      {/* Barre supérieure */}
      <div className="max-w-5xl mx-auto px-3 py-2 sm:py-4 flex items-center gap-3">
        {/* Logo */}
        <Link href="/" aria-label="GERECHTBERG" className="shrink-0">
          <Image src="/Logo-Favicon.png" alt="Logo GERECHTBERG" width={56} height={56} priority className="rounded w-12 h-12 sm:w-14 sm:h-14" />
        </Link>
        {/* Barre de recherche retirée */}
        {/* Droite */}
        <div className="hidden sm:flex items-center gap-3">
          <LanguageSwitcher />
          <AuthStatus />
        </div>
        <div className="sm:hidden ml-auto">
          <MobileNav />
        </div>
      </div>
      {/* Sous-nav */}
      <div className="border-t border-black/5 dark:border-white/10">
        <div className="max-w-5xl mx-auto px-3 py-2">
          <HeaderNav />
        </div>
      </div>
    </header>
  );
}
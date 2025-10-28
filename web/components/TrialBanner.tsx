"use client";
import { useTranslation } from "react-i18next";
import Link from "next/link";

export default function TrialBanner() {
  const { t } = useTranslation();
  return (
    <div className="rounded-xl border bg-brand/10 text-brand border-brand/30 p-3 flex items-center justify-between">
      <span className="text-sm">{t("pricing.trial")}</span>
      <Link href="/tarifs" className="text-sm px-3 py-1 rounded bg-brand text-white hover:bg-brand/80">
        {t("navigation.pricing")}
      </Link>
    </div>
  );
}
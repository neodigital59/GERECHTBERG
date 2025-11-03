"use client";
import { useState, useEffect } from "react";
import { getSupabase } from "@/lib/supabaseUtils";
import { useTranslation } from "react-i18next";
import PageContent from "@/components/PageContent";
import Link from "next/link";

const PRICES = {
  basic: process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC!,
  pro: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO!,
  enterprise: process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE!,
};

// Payment Link URLs (optionnels). Si défini, on redirige directement vers Stripe.
const LINKS = {
  basic: process.env.NEXT_PUBLIC_STRIPE_LINK_BASIC,
  pro: process.env.NEXT_PUBLIC_STRIPE_LINK_PRO,
  enterprise: process.env.NEXT_PUBLIC_STRIPE_LINK_ENTERPRISE,
};

function formatAmount(locale: string, amt?: number | null, currency?: string | null) {
  if (!amt || !currency) return "—";
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amt / 100);
  } catch {
    return `${(amt / 100).toFixed(2)} ${currency?.toUpperCase() || ""}`;
  }
}

export default function TarifsPage() {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState<"basic" | "pro" | "enterprise" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [priceData, setPriceData] = useState<{
    basic?: { unit_amount?: number | null; currency?: string | null };
    pro?: { unit_amount?: number | null; currency?: string | null };
    enterprise?: { unit_amount?: number | null; currency?: string | null };
  }>({});

  async function startCheckout(plan: "basic" | "pro" | "enterprise") {
    setLoading(plan);
    setMessage(null);
    const supabase = getSupabase();
    try {
      const { data: { user } } = supabase ? await supabase.auth.getUser() : { data: { user: null } } as any;
      // Utiliser directement le lien Stripe si configuré pour ce plan
      const linkForPlan = LINKS[plan as keyof typeof LINKS];
      if (linkForPlan) {
        const url = new URL(linkForPlan);
        if (user?.id) url.searchParams.set("client_reference_id", user.id);
        if (user?.email) url.searchParams.set("prefilled_email", user.email);
        location.href = url.toString();
        return;
      }
      // Sinon, basculer sur l'API Checkout avec l'identifiant de prix du plan
      const priceId = PRICES[plan as keyof typeof PRICES];
      if (!priceId) {
        setMessage("Configuration manquante pour ce plan.");
        return;
      }
      const res = await fetch("/api/checkout", {
        method: "POST",
        body: JSON.stringify({ uid: user?.id, priceId }),
      });
      const json = await res.json();
      if (json.url) location.href = json.url;
      else setMessage(json.error || t("pricing.errorStart"));
    } catch (e: any) {
      setMessage(e.message);
    } finally {
      setLoading(null);
    }
  }

  useEffect(() => {
    let mounted = true;
    fetch("/api/pricing")
      .then((r) => r.json())
      .then((data) => {
        if (!mounted || data?.error) return;
        setPriceData({
          basic: { unit_amount: data?.basic?.unit_amount, currency: data?.basic?.currency },
          pro: { unit_amount: data?.pro?.unit_amount, currency: data?.pro?.currency },
          enterprise: { unit_amount: data?.enterprise?.unit_amount, currency: data?.enterprise?.currency },
        });
      })
      .catch(() => {
        // Silencieux: en cas d'erreur, les boutons restent fonctionnels via PRICES.
      });
    return () => { mounted = false; };
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-3 py-4 sm:p-6" suppressHydrationWarning>
      <h1 className="text-xl sm:text-2xl font-semibold mb-2">{t("pricing.title")}</h1>
      <p className="text-sm text-black/70 dark:text-white/70 mb-5 sm:mb-6">
        {t("pricing.trial")}
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5 sm:mt-6">
        <div className="border rounded p-4">
          <h2 className="font-medium">{t("pricing.plans.basic.name")}</h2>
          <p className="text-lg sm:text-xl">
            {
              priceData.basic?.unit_amount && priceData.basic?.currency
                ? (
                    <>
                      {formatAmount(i18n.language, priceData.basic?.unit_amount, priceData.basic?.currency)}
                      {t("pricing.labels.perMonth")} {t("pricing.plans.basic.desc")}
                    </>
                  )
                : (
                    <>
                      {t("pricing.plans.basic.price")}
                    </>
                  )
            }
          </p>
          <p className="text-sm text-black/70 dark:text-white/70">
            {t("pricing.plans.basic.info")}
          </p>
          <button
            disabled
            className="mt-3 w-full bg-gray-200 text-gray-700 rounded py-2.5 sm:py-3"
          >
            {t("pricing.choose.basic")}
          </button>
        </div>
        <div className="border rounded p-4">
          <h2 className="font-medium">{t("pricing.plans.pro.name")}</h2>
          <p className="text-lg sm:text-xl">
            {
              priceData.pro?.unit_amount && priceData.pro?.currency
                ? (
                    <>
                      {formatAmount(i18n.language, priceData.pro?.unit_amount, priceData.pro?.currency)}
                      {t("pricing.labels.perMonth")} {t("pricing.plans.pro.desc")}
                    </>
                  )
                : (
                    <>
                      {t("pricing.plans.pro.price")}
                    </>
                  )
            }
          </p>
          <p className="text-sm text-black/70 dark:text-white/70">
            {t("pricing.plans.pro.info")}
          </p>
          <button
            disabled={loading === "pro"}
            onClick={() => startCheckout("pro")}
            className="mt-3 w-full bg-brand text-white rounded py-2.5 sm:py-3"
          >
            {loading === "pro" ? t("pricing.loading") : t("pricing.choose.pro")}
          </button>
        </div>
        <div className="border rounded p-4">
          <h2 className="font-medium">{t("pricing.plans.enterprise.name")}</h2>
          <p className="text-lg sm:text-xl">
            {
              priceData.enterprise?.unit_amount && priceData.enterprise?.currency
                ? (
                    <>
                      {formatAmount(i18n.language, priceData.enterprise?.unit_amount, priceData.enterprise?.currency)}
                      {t("pricing.labels.perMonth")} {t("pricing.plans.enterprise.desc")}
                    </>
                  )
                : (
                    <>
                      {t("pricing.plans.enterprise.price")}
                    </>
                  )
            }
          </p>
          <p className="text-sm text-black/70 dark:text-white/70">
            {t("pricing.plans.enterprise.info")}
          </p>
          <button
            disabled={loading === "enterprise"}
            onClick={() => startCheckout("enterprise")}
            className="mt-3 w-full bg-brand text-white rounded py-2.5 sm:py-3"
          >
            {loading === "enterprise" ? t("pricing.loading") : t("pricing.choose.enterprise")}
          </button>
        </div>
      </div>

      <div className="mt-5 sm:mt-6">
        <Link href="/documents" className="px-4 py-2.5 sm:py-3 border rounded">{t("actions.backToDashboard")}</Link>
      </div>
      <div className="mt-5 sm:mt-6 border rounded p-4 sm:p-5">
        <h2 className="font-medium mb-2">{t("pricing.coaching.title")}</h2>
        <ul className="list-disc pl-5 space-y-1.5 text-sm text-black/80 dark:text-white/80">
          <li>{t("pricing.coaching.items.1")}</li>
          <li>{t("pricing.coaching.items.2")}</li>
          <li>{t("pricing.coaching.items.3")}</li>
          <li>{t("pricing.coaching.items.4")}</li>
          <li>{t("pricing.coaching.items.5")}</li>
          <li>{t("pricing.coaching.items.6")}</li>
        </ul>
      </div>
      {/* Contenu CMS gérable */}
      <PageContent slug="tarifs" className="mt-8" />
      {message && <p className="mt-4 text-sm text-red-600">{message}</p>}
    </div>
  );
}
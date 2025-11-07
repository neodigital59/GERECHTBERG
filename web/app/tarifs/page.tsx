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
  const OFFERS = {
    basic: {
      name: t("pricing.plans.basic.name"),
      desc: t("pricing.plans.basic.desc"),
    },
    pro: {
      name: t("pricing.plans.pro.name"),
      desc: t("pricing.plans.pro.desc"),
    },
    enterprise: {
      name: t("pricing.plans.enterprise.name"),
      desc: t("pricing.plans.enterprise.desc"),
    },
  } as const;
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6" suppressHydrationWarning>
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-center">{t("pricing.title")}</h1>

      {/* Cartes de tarifs inspirées de l’exemple, avec animation au survol */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {/* Starter Access / Free */}
        <div className="relative bg-white border rounded-xl p-5 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-lg hover:ring-brand/40">
          <div className="mb-2 inline-flex px-3 py-1 rounded-full bg-black/5 text-xs text-black/70">
            {t("pricing.cards.basic.badge")}
          </div>
          <h2 className="font-medium mb-2">{OFFERS.basic.name}</h2>
          <div className="flex items-baseline gap-1 mb-3">
            {priceData.basic?.unit_amount && priceData.basic?.currency ? (
              <>
                <span className="text-3xl font-semibold">
                  {formatAmount(i18n.language, priceData.basic?.unit_amount, priceData.basic?.currency)}
                </span>
                <span className="text-black/60 text-sm">{t("pricing.labels.perMonth")}</span>
              </>
            ) : (
              <span className="text-lg font-medium">{t("pricing.plans.basic.price")}</span>
            )}
          </div>
          <p className="text-sm text-black/70 mb-3 leading-relaxed">{OFFERS.basic.desc}</p>
          <ul className="text-sm text-black/70 space-y-1.5 mb-4 leading-relaxed">
            <li className="flex items-start gap-2"><svg aria-hidden className="mt-0.5 h-4 w-4 text-brand" viewBox="0 0 20 20" fill="currentColor"><path d="M16.704 5.292a1 1 0 0 1 0 1.416l-7.5 7.5a1 1 0 0 1-1.416 0l-3.5-3.5a1 1 0 1 1 1.416-1.416l2.792 2.792 6.792-6.792a1 1 0 0 1 1.416 0Z"/></svg>{t("pricing.cards.basic.items.1")}</li>
            <li className="flex items-start gap-2"><svg aria-hidden className="mt-0.5 h-4 w-4 text-brand" viewBox="0 0 20 20" fill="currentColor"><path d="M16.704 5.292a1 1 0 0 1 0 1.416l-7.5 7.5a1 1 0 0 1-1.416 0l-3.5-3.5a1 1 0 1 1 1.416-1.416l2.792 2.792 6.792-6.792a1 1 0 0 1 1.416 0Z"/></svg>{t("pricing.cards.basic.items.2")}</li>
            <li className="flex items-start gap-2"><svg aria-hidden className="mt-0.5 h-4 w-4 text-brand" viewBox="0 0 20 20" fill="currentColor"><path d="M16.704 5.292a1 1 0 0 1 0 1.416l-7.5 7.5a1 1 0 0 1-1.416 0l-3.5-3.5a1 1 0 1 1 1.416-1.416l2.792 2.792 6.792-6.792a1 1 0 0 1 1.416 0Z"/></svg>{t("pricing.cards.basic.items.3")}</li>
          </ul>
          <button disabled className="w-full rounded px-4 py-2.5 bg-black/5 text-black/60">{t("pricing.choose.basic")}</button>
        </div>

        {/* Essentiel Premium */}
        <div className="relative bg-white border rounded-xl p-5 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-lg hover:ring-brand/40">
          <div className="mb-2 inline-flex px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs">
            {t("pricing.cards.pro.badge")}
          </div>
          <h2 className="font-medium mb-2">{OFFERS.pro.name}</h2>
          <div className="flex items-baseline gap-1 mb-3">
            {priceData.pro?.unit_amount && priceData.pro?.currency ? (
              <>
                <span className="text-3xl font-semibold">
                  {formatAmount(i18n.language, priceData.pro?.unit_amount, priceData.pro?.currency)}
                </span>
                <span className="text-black/60 text-sm">{t("pricing.labels.perMonth")}</span>
              </>
            ) : (
              <span className="text-lg font-medium">{t("pricing.plans.pro.price")}</span>
            )}
          </div>
          <p className="text-sm text-black/70 mb-3 leading-relaxed">{OFFERS.pro.desc}</p>
          <ul className="text-sm text-black/70 space-y-1.5 mb-4 leading-relaxed">
            <li className="flex items-start gap-2"><svg aria-hidden className="mt-0.5 h-4 w-4 text-brand" viewBox="0 0 20 20" fill="currentColor"><path d="M16.704 5.292a1 1 0 0 1 0 1.416l-7.5 7.5a1 1 0 0 1-1.416 0l-3.5-3.5a1 1 0 1 1 1.416-1.416l2.792 2.792 6.792-6.792a1 1 0 0 1 1.416 0Z"/></svg>{t("pricing.cards.pro.items.1")}</li>
            <li className="flex items-start gap-2"><svg aria-hidden className="mt-0.5 h-4 w-4 text-brand" viewBox="0 0 20 20" fill="currentColor"><path d="M16.704 5.292a1 1 0 0 1 0 1.416l-7.5 7.5a1 1 0 0 1-1.416 0l-3.5-3.5a1 1 0 1 1 1.416-1.416l2.792 2.792 6.792-6.792a1 1 0 0 1 1.416 0Z"/></svg>{t("pricing.cards.pro.items.2")}</li>
            <li className="flex items-start gap-2"><svg aria-hidden className="mt-0.5 h-4 w-4 text-brand" viewBox="0 0 20 20" fill="currentColor"><path d="M16.704 5.292a1 1 0 0 1 0 1.416l-7.5 7.5a1 1 0 0 1-1.416 0l-3.5-3.5a1 1 0 1 1 1.416-1.416l2.792 2.792 6.792-6.792a1 1 0 0 1 1.416 0Z"/></svg>{t("pricing.cards.pro.items.3")}</li>
          </ul>
          <button
            disabled={loading === "pro"}
            onClick={() => startCheckout("pro")}
            className="w-full rounded px-4 py-2.5 bg-brand text-white hover:bg-brand/90"
          >
            {loading === "pro" ? t("pricing.loading") : t("pricing.choose.pro")}
          </button>
        </div>

        {/* Supreme Titanium */}
        <div className="relative bg-white border rounded-xl p-5 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-lg hover:ring-brand/40">
          <div className="mb-2 inline-flex px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs">
            {t("pricing.cards.enterprise.badge")}
          </div>
          <h2 className="font-medium mb-2">{OFFERS.enterprise.name}</h2>
          <div className="flex items-baseline gap-1 mb-3">
            {priceData.enterprise?.unit_amount && priceData.enterprise?.currency ? (
              <>
                <span className="text-3xl font-semibold">
                  {formatAmount(i18n.language, priceData.enterprise?.unit_amount, priceData.enterprise?.currency)}
                </span>
                <span className="text-black/60 text-sm">{t("pricing.labels.perMonth")}</span>
              </>
            ) : (
              <span className="text-lg font-medium">{t("pricing.plans.enterprise.price")}</span>
            )}
          </div>
          <p className="text-sm text-black/70 mb-3 leading-relaxed">{OFFERS.enterprise.desc}</p>
          <ul className="text-sm text-black/70 space-y-1.5 mb-4 leading-relaxed">
            <li className="flex items-start gap-2"><svg aria-hidden className="mt-0.5 h-4 w-4 text-brand" viewBox="0 0 20 20" fill="currentColor"><path d="M16.704 5.292a1 1 0 0 1 0 1.416l-7.5 7.5a1 1 0 0 1-1.416 0l-3.5-3.5a1 1 0 1 1 1.416-1.416l2.792 2.792 6.792-6.792a1 1 0 0 1 1.416 0Z"/></svg>{t("pricing.cards.enterprise.items.1")}</li>
            <li className="flex items-start gap-2"><svg aria-hidden className="mt-0.5 h-4 w-4 text-brand" viewBox="0 0 20 20" fill="currentColor"><path d="M16.704 5.292a1 1 0 0 1 0 1.416l-7.5 7.5a1 1 0 0 1-1.416 0l-3.5-3.5a1 1 0 1 1 1.416-1.416l2.792 2.792 6.792-6.792a1 1 0 0 1 1.416 0Z"/></svg>{t("pricing.cards.enterprise.items.2")}</li>
            <li className="flex items-start gap-2"><svg aria-hidden className="mt-0.5 h-4 w-4 text-brand" viewBox="0 0 20 20" fill="currentColor"><path d="M16.704 5.292a1 1 0 0 1 0 1.416l-7.5 7.5a1 1 0 0 1-1.416 0l-3.5-3.5a1 1 0 1 1 1.416-1.416l2.792 2.792 6.792-6.792a1 1 0 0 1 1.416 0Z"/></svg>{t("pricing.cards.enterprise.items.3")}</li>
          </ul>
          <button
            disabled={loading === "enterprise"}
            onClick={() => startCheckout("enterprise")}
            className="w-full rounded px-4 py-2.5 bg-brand text-white hover:bg-brand/90"
          >
            {loading === "enterprise" ? t("pricing.loading") : t("pricing.choose.enterprise")}
          </button>
        </div>
      </div>

      {/* Liens complémentaires */}
      <div className="mt-6 text-center">
        <Link href="/documents" className="inline-flex items-center justify-center px-4 py-2.5 border rounded hover:bg-black/5">{t("actions.backToDashboard")}</Link>
      </div>

      {/* Coaching / contenu additionnel */}
      <div className="mt-6 border rounded-xl p-5 bg-white shadow-sm ring-1 ring-black/5">
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
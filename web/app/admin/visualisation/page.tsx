"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Bar, Pie, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import RequireAuth from "@/components/RequireAuth";

ChartJS.register(BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend);

interface AnalyticsData {
  kpis: { totalUsers: number; totalDocs: number; activeSubs: number };
  plans: Record<string, number>;
  byLang: Record<string, number>;
  byStatus: Record<string, number>;
  docsLast7: { day: string; count: number }[];
  demo?: boolean;
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        const res = await fetch("/api/admin/analytics", {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Erreur de chargement");
        if (mounted) setData(json);
      } catch (e: any) {
        if (mounted) setError(e.message || "Erreur inconnue");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <RequireAuth>
      <div className="space-y-6">
        {/* KPIs */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="border rounded-xl p-4 bg-white shadow-sm">
            <p className="text-sm text-black/60">Utilisateurs</p>
            <p className="text-2xl font-semibold">{data?.kpis.totalUsers ?? (loading ? "…" : 0)}</p>
          </div>
          <div className="border rounded-xl p-4 bg-white shadow-sm">
            <p className="text-sm text-black/60">Documents</p>
            <p className="text-2xl font-semibold">{data?.kpis.totalDocs ?? (loading ? "…" : 0)}</p>
          </div>
          <div className="border rounded-xl p-4 bg-white shadow-sm">
            <p className="text-sm text-black/60">Abonnements actifs</p>
            <p className="text-2xl font-semibold">{data?.kpis.activeSubs ?? (loading ? "…" : 0)}</p>
          </div>
        </div>

        {error && (
          <div className="border border-red-300 bg-red-50 rounded p-3 text-sm">{error}</div>
        )}

        {/* Graphique: Documents sur 7 jours */}
        <section className="bg-white border rounded-xl p-4 shadow-sm">
          <p className="font-medium mb-2">Documents créés (7 derniers jours)</p>
          <div className="h-64">
            {data && (
              <Bar
                data={{
                  labels: data.docsLast7.map((d) => d.day.slice(5)),
                  datasets: [
                    {
                      label: "Documents",
                      data: data.docsLast7.map((d) => d.count),
                      backgroundColor: "rgba(46, 204, 113, 0.6)",
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                }}
              />
            )}
          </div>
        </section>

        {/* Graphique: Langues */}
        <section className="grid md:grid-cols-2 gap-4">
          <div className="bg-white border rounded-xl p-4 shadow-sm">
            <p className="font-medium mb-2">Répartition par langue</p>
            <div className="h-64">
              {data && (
                <Pie
                  data={{
                    labels: Object.keys(data.byLang),
                    datasets: [
                      {
                        label: "Langues",
                        data: Object.values(data.byLang),
                        backgroundColor: [
                          "rgba(46, 204, 113, 0.6)",
                          "rgba(52, 152, 219, 0.6)",
                          "rgba(243, 156, 18, 0.6)",
                          "rgba(231, 76, 60, 0.6)",
                          "rgba(155, 89, 182, 0.6)",
                        ],
                      },
                    ],
                  }}
                  options={{ responsive: true, maintainAspectRatio: false }}
                />
              )}
            </div>
          </div>

          <div className="bg-white border rounded-xl p-4 shadow-sm">
            <p className="font-medium mb-2">Statuts des documents</p>
            <div className="h-64">
              {data && (
                <Doughnut
                  data={{
                    labels: Object.keys(data.byStatus),
                    datasets: [
                      {
                        label: "Statuts",
                        data: Object.values(data.byStatus),
                        backgroundColor: [
                          "rgba(52, 152, 219, 0.6)",
                          "rgba(46, 204, 113, 0.6)",
                          "rgba(241, 196, 15, 0.6)",
                          "rgba(127, 140, 141, 0.6)",
                        ],
                      },
                    ],
                  }}
                  options={{ responsive: true, maintainAspectRatio: false }}
                />
              )}
            </div>
          </div>
        </section>

        {/* Graphique: Plans */}
        <section className="bg-white border rounded-xl p-4 shadow-sm">
          <p className="font-medium mb-2">Plans d’abonnement</p>
          <div className="h-64">
            {data && (
              <Bar
                data={{
                  labels: Object.keys(data.plans),
                  datasets: [
                    { label: "Utilisateurs", data: Object.values(data.plans), backgroundColor: "rgba(52, 152, 219, 0.6)" },
                  ],
                }}
                options={{ responsive: true, maintainAspectRatio: false }}
              />
            )}
          </div>
        </section>

        {data?.demo && (
          <p className="text-xs text-black/50">Mode démo: agrégations limitées sans clé service-role.</p>
        )}
      </div>
    </RequireAuth>
  );
}
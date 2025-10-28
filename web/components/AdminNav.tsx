"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminNav() {
  const pathname = usePathname();
  const tabs = [
    { href: "/admin/visualisation", label: "Visualisation" },
    { href: "/admin/rendezvous", label: "Rendez-vous" },
    { href: "/admin/utilisateurs", label: "Utilisateurs" },
    { href: "/admin/contact", label: "Contact" },
    { href: "/admin/documents", label: "Documents" },
    { href: "/admin/pages", label: "Pages" },
    { href: "/admin/alertes", label: "Alertes" },
    { href: "/admin/abonnements", label: "Abonnements" },
    { href: "/admin/configuration", label: "Configuration" },
  ];
  return (
    <nav className="flex flex-wrap gap-2 text-sm">
      {tabs.map(t => {
        const active = pathname?.startsWith(t.href) || pathname === "/admin" && t.href.endsWith("visualisation");
        return (
          <Link key={t.href} href={t.href} className={`px-3 py-2 rounded border ${active ? "bg-brand text-white border-brand" : "hover:text-brand"}`}>{t.label}</Link>
        );
      })}
    </nav>
  );
}
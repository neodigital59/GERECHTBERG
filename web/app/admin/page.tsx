import Link from "next/link";

export default function AdminHome() {
  const cards = [
    { href: "/admin/visualisation", title: "Visualisation", desc: "Graphiques et KPIs" },
    { href: "/admin/rendezvous", title: "Rendez-vous", desc: "Planning et exports" },
    { href: "/admin/utilisateurs", title: "Utilisateurs", desc: "Liste et abonnements" },
    { href: "/admin/contact", title: "Contact", desc: "Messages du formulaire" },
    { href: "/admin/documents", title: "Documents", desc: "Registre et métadonnées" },
    { href: "/admin/pages", title: "Pages", desc: "Contenu du site (CMS)" },
    { href: "/admin/alertes", title: "Alertes", desc: "Essais et paiements" },
    { href: "/admin/abonnements", title: "Abonnements", desc: "Plans et statut" },
    { href: "/admin/configuration", title: "Configuration", desc: "Langue et IA" },
  ];
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {cards.map(c => (
        <Link key={c.href} href={c.href} className="block border rounded-xl p-4 bg-white shadow-sm ring-1 ring-black/5 hover:ring-brand/40 hover:-translate-y-0.5 transition">
          <p className="font-medium mb-1">{c.title}</p>
          <p className="text-sm text-black/70">{c.desc}</p>
        </Link>
      ))}
    </div>
  );
}
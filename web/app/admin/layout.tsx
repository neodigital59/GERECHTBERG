import RequireAuth from "@/components/RequireAuth";
import AdminNav from "@/components/AdminNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Administration</h1>
            <p className="text-sm text-black/70 dark:text-white/70">Gérez données, utilisateurs et configuration</p>
          </div>
        </div>
        <div className="bg-white border rounded-xl p-4 shadow-sm mb-6">
          <AdminNav />
        </div>
        {children}
      </div>
    </RequireAuth>
  );
}
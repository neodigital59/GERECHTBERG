"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminClient } from "@/lib/supabaseAdmin";

export async function createPage(_prevState: any, formData: FormData) {
  const supa = getAdminClient();
  if (!supa) return { error: "Configuration Supabase manquante côté serveur." };
  const title = (formData.get("title") as string || "").trim();
  const slug = (formData.get("slug") as string || "").trim();
  const content = (formData.get("content") as string || "").trim();
  const published = formData.get("published") === "on";
  if (!title || !slug) return { error: "Titre et slug sont requis." };
  const { data: existing } = await supa.from("pages").select("id").eq("slug", slug).maybeSingle();
  if (existing) return { error: "Ce slug est déjà utilisé." };
  const { data, error } = await supa.from("pages").insert({ title, slug, content, published }).select().maybeSingle();
  if (error) return { error: error.message };
  revalidatePath(`/admin/pages`);
  revalidatePath(`/${slug}`);
  redirect(`/admin/pages/${data!.id}`);
}

export async function updatePage(_prevState: any, formData: FormData) {
  const supa = getAdminClient();
  if (!supa) return { error: "Configuration Supabase manquante côté serveur." };
  const id = (formData.get("id") as string || "").trim();
  const title = (formData.get("title") as string || "").trim();
  const slug = (formData.get("slug") as string || "").trim();
  const content = (formData.get("content") as string || "").trim();
  const published = formData.get("published") === "on";
  if (!id || !title || !slug) return { error: "ID, titre et slug sont requis." };
  const { error } = await supa.from("pages").update({ title, slug, content, published, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath(`/admin/pages`);
  revalidatePath(`/${slug}`);
  redirect(`/admin/pages/${id}`);
}

export async function deletePage(_prevState: any, formData: FormData) {
  const supa = getAdminClient();
  if (!supa) return { error: "Configuration Supabase manquante côté serveur." };
  const id = (formData.get("id") as string || "").trim();
  const slug = (formData.get("slug") as string || "").trim();
  if (!id) return { error: "ID requis." };
  const { error } = await supa.from("pages").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath(`/admin/pages`);
  if (slug) revalidatePath(`/${slug}`);
  redirect(`/admin/pages`);
}
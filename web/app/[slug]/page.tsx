import { supabase } from "@/lib/supabaseClient";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PublicPage({ params }: { params: { slug: string } }) {
  const { data: page, error } = await supabase
    .from("pages")
    .select("title, content, published")
    .eq("slug", params.slug)
    .eq("published", true)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!page) return notFound();
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-4">{page.title}</h1>
      <div className="prose dark:prose-invert" dangerouslySetInnerHTML={{ __html: page.content || "" }} />
    </div>
  );
}
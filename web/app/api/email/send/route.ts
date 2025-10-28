import { NextRequest } from "next/server";
import { createTransport } from "nodemailer";
import { createClient } from "@supabase/supabase-js";
import { requireUser } from "@/lib/authServer";

export const runtime = "nodejs";

function sanitizeFilename(title?: string | null, ext: string = "txt", id?: string) {
  const base = (title || "Document").normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  const cleaned = base.replace(/[^a-zA-Z0-9 _.-]/g, " ").trim().replace(/\s+/g, " ").slice(0, 160) || `document_${id || "untitled"}`;
  return `${cleaned}.${ext}`;
}

function isValidEmail(e?: string | null) {
  if (!e) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req);
    if (user instanceof Response) return user;

    const { to, subject, message, documentIds, format } = await req.json();
    const fmt = (format || "txt").toLowerCase();
    if (!isValidEmail(to)) {
      return new Response(JSON.stringify({ error: "Email destinataire invalide" }), { status: 400 });
    }
    if (!Array.isArray(documentIds) || documentIds.length === 0) {
      return new Response(JSON.stringify({ error: "Aucun document sélectionné" }), { status: 400 });
    }
    if (fmt !== "txt") {
      // Pour MVP: on supporte uniquement TXT côté serveur
      return new Response(JSON.stringify({ error: "Format non supporté (utilisez txt)" }), { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
    if (!supabaseUrl || !serviceKey) {
      return new Response(JSON.stringify({ error: "Configuration Supabase manquante" }), { status: 500 });
    }
    const admin = createClient(supabaseUrl, serviceKey);

    const { data: rows, error } = await admin
      .from("documents")
      .select("id,titre,contenu,user_id")
      .in("id", documentIds)
      .eq("user_id", user.id);
    if (error) throw error;

    const docs = (rows || []).filter((r: any) => (r?.contenu || "").trim().length > 0);
    if (docs.length === 0) {
      return new Response(JSON.stringify({ error: "Contenu vide: aucun document avec texte" }), { status: 400 });
    }

    const host = process.env.BREVO_SMTP_HOST || "smtp-relay.brevo.com";
    const port = Number(process.env.BREVO_SMTP_PORT || 587);
    const userSmtp = process.env.BREVO_SMTP_USER || "997812001@smtp-brevo.com";
    const passSmtp = process.env.BREVO_SMTP_PASSWORD;
    const fromEmail = process.env.BREVO_FROM || userSmtp;

    if (!passSmtp) {
      return new Response(JSON.stringify({ error: "Mot de passe SMTP Brevo manquant (BREVO_SMTP_PASSWORD)" }), { status: 500 });
    }

    const transport = createTransport({
      host,
      port,
      secure: false,
      auth: { user: userSmtp, pass: passSmtp },
    });

    const attachments = docs.map((d: any) => ({
      filename: sanitizeFilename(d.titre, "txt", d.id),
      content: Buffer.from(String(d.contenu || ""), "utf-8"),
      contentType: "text/plain",
    }));

    const info = await transport.sendMail({
      from: fromEmail,
      to: String(to).trim(),
      subject: String(subject || "Documents GERECHTBERG"),
      text: String(message || "Veuillez trouver les documents en pièces jointes."),
      attachments,
    });

    return Response.json({ ok: true, messageId: info.messageId, sentCount: attachments.length });
  } catch (e: any) {
    console.error("Email send error", e);
    const reason = e?.message || "Erreur d’envoi";
    return new Response(JSON.stringify({ error: reason }), { status: 500 });
  }
}
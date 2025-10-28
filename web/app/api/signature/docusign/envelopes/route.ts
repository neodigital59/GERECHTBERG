import { NextRequest } from "next/server";
import { createEnvelope } from "@/lib/docusign";
import { getAdminClient } from "@/lib/supabaseAdmin";
import { rateLimit, getClientIp } from "@/lib/security/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const rl = rateLimit(ip, "docusign-envelopes", 30, 60_000);
  if (!rl.allowed) {
    return Response.json({ error: "Trop de requêtes" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { email, name, documentId, docName, returnUrl, base64Doc, embedded, clientUserId } = body || {};
    if (!email || !name) {
      return Response.json({ error: "Paramètres manquants" }, { status: 400 });
    }
    const result = await createEnvelope({ email, name, documentId, docName, returnUrl, base64Doc, embedded, clientUserId });
    const admin = getAdminClient();
    if (admin) {
      await admin.from("signature_events").insert({
        type: "envelope_created",
        document_id: documentId ?? null,
        envelope_id: result.envelopeId ?? null,
        details: result,
      });
    }
    return Response.json(result);
  } catch (e: any) {
    return Response.json({ error: e?.message || "Erreur DocuSign" }, { status: 500 });
  }
}
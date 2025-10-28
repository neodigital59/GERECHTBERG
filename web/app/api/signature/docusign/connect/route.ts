import { NextRequest } from "next/server";
import { verifyConnectSignature } from "@/lib/docusign";
import { getAdminClient } from "@/lib/supabaseAdmin";
import { rateLimit, getClientIp } from "@/lib/security/rateLimit";
import { XMLParser } from "fast-xml-parser";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const rl = rateLimit(ip, "docusign-connect", 100, 60_000);
  if (!rl.allowed) {
    return Response.json({ error: "Trop de requêtes" }, { status: 429 });
  }

  try {
    const admin = getAdminClient();
    const connectSecret = process.env.DOCUSIGN_CONNECT_SECRET;
    const rawBody = await req.text();
    const sig = req.headers.get("x-docusign-signature-1") || undefined;

    const isValid = verifyConnectSignature(rawBody, sig || undefined, connectSecret);
    if (!isValid) {
      return new Response("Invalid signature", { status: 401 });
    }

    let payload: any = null;
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("xml")) {
      const parser = new XMLParser({ ignoreAttributes: false });
      payload = parser.parse(rawBody);
    } else {
      payload = JSON.parse(rawBody);
    }

    const envelopeId = payload?.EnvelopeId || payload?.envelopeId || payload?.envelope?.envelopeId || null;
    const documentId = payload?.CustomFields?.TextCustomFields?.find?.((f: any) => f?.Name === "document_id")?.Value
      || payload?.customFields?.textCustomFields?.find?.((f: any) => f?.name === "document_id")?.value
      || null;

    if (admin) {
      await admin.from("signature_events").insert({
        type: "connect_event",
        provider: "docusign",
        envelope_id: envelopeId,
        document_id: documentId,
        details: payload,
      });
      if (documentId && envelopeId) {
        await admin.from("documents").update({ statut: "en_signature" }).eq("id", documentId);
      }
    }

    return Response.json({ ok: true });
  } catch (e: any) {
    return Response.json({ error: e?.message || "Erreur Connect DocuSign" }, { status: 500 });
  }
}
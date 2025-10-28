import { NextRequest } from "next/server";
import { getAdminClient } from "@/lib/supabaseAdmin";
import { rateLimit, getClientIp } from "@/lib/security/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const rl = rateLimit(ip, "timestamp", 20, 60_000);
  if (!rl.allowed) {
    return Response.json({ error: "Trop de requêtes" }, { status: 429 });
  }

  try {
    const { documentId, content } = await req.json();
    if (!documentId || typeof content !== "string") {
      return Response.json({ error: "Paramètres manquants" }, { status: 400 });
    }
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const buf = await crypto.subtle.digest("SHA-256", data);
    const hashHex = Array.from(new Uint8Array(buf)).map((b)=>b.toString(16).padStart(2,"0")).join("");

    const secret = process.env.TIMESTAMP_SECRET || "demo-secret";
    const cryptoNode = await import("crypto");
    const hmac = cryptoNode.createHmac("sha256", secret);
    hmac.update(`${documentId}:${hashHex}:${Date.now()}`);
    const receipt = hmac.digest("hex");

    const admin = getAdminClient();
    if (admin) {
      await admin.from("document_timestamps").insert({ document_id: documentId, hash: hashHex, receipt });
      await admin.from("documents").update({ hash: hashHex, statut: "horodaté" }).eq("id", documentId);
    }

    return Response.json({ documentId, hash: hashHex, receipt });
  } catch (e: any) {
    return Response.json({ error: e?.message || "Erreur horodatage" }, { status: 500 });
  }
}
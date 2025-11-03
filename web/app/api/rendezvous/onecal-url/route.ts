import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/authServer";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const { searchParams } = new URL(req.url);
    const appointmentId = searchParams.get("appointmentId");

    if (!appointmentId) {
      return NextResponse.json(
        { error: "appointmentId requis" },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const token = req.headers.get("authorization") || req.headers.get("Authorization") || undefined;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: token ? { Authorization: token } : {},
      },
    });

    const { data: appointment, error } = await supabase
      .from("appointments")
      .select("id, user_id, status")
      .eq("id", appointmentId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!appointment) {
      return NextResponse.json({ error: "Appointment introuvable" }, { status: 404 });
    }
    if (appointment.user_id !== user.id) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
    if (appointment.status !== "paid") {
      return NextResponse.json({ error: "Paiement non confirmé" }, { status: 403 });
    }

    const url = process.env.NEXT_PUBLIC_ONECAL_URL;
    if (!url) {
      return NextResponse.json({ error: "NEXT_PUBLIC_ONECAL_URL manquant" }, { status: 500 });
    }

    return NextResponse.json({ url });
  } catch (err: any) {
    console.error("onecal-url error", err);
    return NextResponse.json(
      { error: err?.message || "Erreur inconnue" },
      { status: 500 }
    );
  }
}
import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

function isEmailValid(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isPasswordStrong(pw: string) {
  // 8-72 chars, at least 1 lower, 1 upper, 1 digit, 1 special
  if (pw.length < 8 || pw.length > 72) return false;
  const hasLower = /[a-z]/.test(pw);
  const hasUpper = /[A-Z]/.test(pw);
  const hasDigit = /\d/.test(pw);
  const hasSpecial = /[^A-Za-z0-9]/.test(pw);
  return hasLower && hasUpper && hasDigit && hasSpecial;
}

function sanitizeName(name: string) {
  return name.trim();
}

function isNameValid(name: string) {
  const n = sanitizeName(name);
  if (n.length < 2 || n.length > 100) return false;
  // Allow letters, spaces, apostrophes, hyphens
  return /^[\p{L}\p{M}' -]+$/u.test(n);
}

function isCountryCodeValid(code: string) {
  return /^[A-Za-z]{2}$/.test(code);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = sanitizeName(String(body.name || ""));
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const passwordConfirm = String(body.passwordConfirm || "");
    const country = String(body.country || "").toUpperCase();
    const accept = Boolean(body.accept);

    if (!name || !email || !password || !country) {
      return new Response(JSON.stringify({ error: "Tous les champs sont requis" }), { status: 400 });
    }
    if (!isNameValid(name)) {
      return new Response(JSON.stringify({ error: "Nom invalide (2–100 caractères)" }), { status: 400 });
    }
    if (!isEmailValid(email)) {
      return new Response(JSON.stringify({ error: "Email invalide" }), { status: 400 });
    }
    if (passwordConfirm !== password) {
      return new Response(JSON.stringify({ error: "Les mots de passe ne correspondent pas" }), { status: 400 });
    }
    if (!isPasswordStrong(password)) {
      return new Response(
        JSON.stringify({
          error: "Mot de passe non conforme (8+ caractères, minuscule, majuscule, chiffre, symbole)",
        }),
        { status: 400 }
      );
    }
    if (!isCountryCodeValid(country)) {
      return new Response(JSON.stringify({ error: "Code pays invalide" }), { status: 400 });
    }
    if (!accept) {
      return new Response(JSON.stringify({ error: "Veuillez accepter les conditions d’utilisation" }), { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    if (!supabaseUrl || !supabaseAnonKey) {
      return new Response(JSON.stringify({ error: "Configuration Supabase manquante" }), { status: 500 });
    }

    // Sign up via anon key to leverage project’s email confirmation settings
    const client = createClient(supabaseUrl, supabaseAnonKey);
    const { data: signUpData, error: signUpError } = await client.auth.signUp({
      email,
      password,
      options: {
        data: { name, country },
        emailRedirectTo: `${baseUrl}/auth`,
      },
    });
    if (signUpError) {
      // Avoid leaking internal details
      const msg = signUpError.message?.includes("already registered")
        ? "Cet email est déjà utilisé"
        : signUpError.message || "Inscription impossible";
      return new Response(JSON.stringify({ error: msg }), { status: 400 });
    }

    const userId = signUpData.user?.id;

    // Optionally create profile row immediately (service role), so metadata is ready
    if (userId && serviceKey) {
      try {
        const admin = createClient(supabaseUrl, serviceKey);
        const trialStart = new Date();
        const trialEnd = new Date(trialStart.getTime() + 7 * 86400000);
        await admin.from("users").upsert({
          id: userId,
          email,
          role: "user",
          plan: "trial",
          trial_start: trialStart.toISOString(),
          trial_end: trialEnd.toISOString(),
          name,
          country,
        });
      } catch (e) {
        // If profile upsert fails, do not block signup; client can recover with ensureTrialProfile
        console.warn("Profile upsert failed", e);
      }
    }

    return Response.json({
      message: "Inscription initiée. Vérifiez votre email pour confirmer votre compte.",
      userId,
    });
  } catch (e: any) {
    console.error("Register error", e);
    return new Response(JSON.stringify({ error: e.message || "Erreur d'inscription" }), { status: 500 });
  }
}
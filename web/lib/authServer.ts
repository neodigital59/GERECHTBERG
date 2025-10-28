import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export interface AuthUser {
  id: string;
  email?: string;
}

function getAccessToken(req: NextRequest): string | null {
  const auth = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!auth) return null;
  const m = auth.match(/^Bearer\s+(.+)$/i);
  return m ? m[1] : null;
}

export async function getUserFromRequest(req: NextRequest): Promise<AuthUser | null> {
  try {
    const token = getAccessToken(req);
    if (!token) return null;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
    if (!supabaseUrl || !supabaseAnonKey) return null;
    const client = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data, error } = await client.auth.getUser();
    if (error || !data?.user) return null;
    return { id: data.user.id, email: data.user.email ?? undefined };
  } catch (_) {
    return null;
  }
}

export async function requireUser(req: NextRequest): Promise<AuthUser | Response> {
  const user = await getUserFromRequest(req);
  if (!user) {
    return new Response(JSON.stringify({ error: "Non authentifié" }), { status: 401 });
  }
  return user;
}
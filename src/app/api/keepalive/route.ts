import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/** Chamado pela Vercel a cada 3 dias (vercel.json) para o Supabase grátis não pausar o banco por falta de uso. */
export async function GET() {
  try {
    const admin = createAdminClient();
    const { count, error } = await admin.from("organizations").select("id", { count: "exact", head: true });
    if (error) return Response.json({ ok: false, error: error.message }, { status: 503 });
    return Response.json({ ok: true, organizations: count, at: new Date().toISOString() });
  } catch (e) {
    return Response.json({ ok: false, error: e instanceof Error ? e.message : String(e) }, { status: 503 });
  }
}

import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

export const INITIAL_SYNC_TOKEN_SHA256 = "ae9d188073404004d90a21ed7cfe0c5b4fbb1232686bcb5d352f7fe37c5595e8";

/** Organização dona da chave de sincronização do PC (ou erro pronto para responder). */
export async function orgFromSyncToken(request: Request, admin: SupabaseClient) {
  const token = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();
  if (token.length < 32) return { error: Response.json({ error: "Chave de sincronização ausente." }, { status: 401 }) };
  const hash = createHash("sha256").update(token).digest("hex");
  const byHash = await admin.from("organizations").select("id,slug,settings").eq("settings->>projectsSyncTokenSha256", hash).maybeSingle();
  if (byHash.data) return { org: byHash.data };
  if (hash !== INITIAL_SYNC_TOKEN_SHA256) return { error: Response.json({ error: "Chave de sincronização inválida." }, { status: 403 }) };
  // Primeira sincronização (antes da migração gravar o hash): ateliê com uma organização só.
  const { data: orgs, error } = await admin.from("organizations").select("id,slug,settings").limit(2);
  if (error) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    let host = "inválida"; try { host = new URL(url.trim()).hostname; } catch {}
    return { error: Response.json({ error: `Não foi possível ler a organização: ${error.message}`, details: error.details, supabaseHost: host }, { status: 500 }) };
  }
  const org = orgs?.find((o) => o.slug === "lamelle-3d") ?? (orgs?.length === 1 ? orgs[0] : null);
  if (!org) return { error: Response.json({ error: `Organização não encontrada (${orgs?.length ?? 0} visível(is)).` }, { status: 403 }) };
  return { org };
}

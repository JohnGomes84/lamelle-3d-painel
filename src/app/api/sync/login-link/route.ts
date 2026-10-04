import { createHash } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { INITIAL_SYNC_TOKEN_SHA256 } from "@/lib/auth/sync-token";

export const dynamic = "force-dynamic";

/**
 * Link de acesso de uso único para o dono, gerado sem depender do envio de e-mail
 * (o e-mail grátis do Supabase pode não entregar). Só aceita a chave do PC.
 */
export async function POST(request: Request) {
  const token = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();
  const hash = createHash("sha256").update(token).digest("hex");
  let admin;
  try { admin = createAdminClient(); } catch { return Response.json({ error: "Servidor sem credenciais administrativas." }, { status: 500 }); }
  const known = await admin.from("organizations").select("id").eq("settings->>projectsSyncTokenSha256", hash).maybeSingle();
  if (!known.data && hash !== INITIAL_SYNC_TOKEN_SHA256) return Response.json({ error: "Chave inválida." }, { status: 403 });
  const email = process.env.LAMELLE_OWNER_EMAIL?.trim().toLowerCase();
  if (!email) return Response.json({ error: "LAMELLE_OWNER_EMAIL não definida." }, { status: 500 });
  const { data, error } = await admin.auth.admin.generateLink({ type: "magiclink", email });
  if (error || !data.properties?.hashed_token) return Response.json({ error: `Falha ao gerar o link: ${error?.message || "sem token"}` }, { status: 500 });
  const origin = new URL(request.url).origin;
  const link = `${origin}/auth/confirm?token_hash=${encodeURIComponent(data.properties.hashed_token)}&type=magiclink&next=/settings`;
  const masked = email.replace(/^(.{2}).*(@.*)$/, "$1***$2");
  return Response.json({ email: masked, link });
}

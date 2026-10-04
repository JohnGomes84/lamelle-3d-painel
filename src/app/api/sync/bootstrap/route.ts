import { createHash } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { INITIAL_SYNC_TOKEN_SHA256 } from "@/lib/auth/sync-token";

export const dynamic = "force-dynamic";

/**
 * Prepara um banco novo: cria a organização Lamelle 3D e os acessos do dono e da sócia
 * (mesma lógica de scripts/bootstrap-users.mjs). Só aceita a chave do PC. Pode rodar de novo sem duplicar.
 */
export async function POST(request: Request) {
  const token = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();
  const hash = createHash("sha256").update(token).digest("hex");
  let admin;
  try { admin = createAdminClient(); } catch { return Response.json({ error: "Servidor sem credenciais administrativas." }, { status: 500 }); }
  const known = await admin.from("organizations").select("id").eq("settings->>projectsSyncTokenSha256", hash).maybeSingle();
  if (!known.data && hash !== INITIAL_SYNC_TOKEN_SHA256) return Response.json({ error: "Chave inválida." }, { status: 403 });

  const steps: string[] = [];
  let { data: org } = await admin.from("organizations").select("id").eq("slug", "lamelle-3d").maybeSingle();
  if (!org) {
    const { data, error } = await admin.from("organizations").insert({
      name: "Lamelle 3D", slug: "lamelle-3d",
      settings: { printer: "Bambu Lab A1", weeklyCapacity: 40, filamentKgPrice: 120, kwhRate: 0.95, printerValue: 2000, printerLifeHours: 2000, laborHour: 30, defaultMultiplier: 3, projectsSyncTokenSha256: hash },
    }).select("id").single();
    if (error) return Response.json({ error: `Falha ao criar a organização: ${error.message}` }, { status: 500 });
    org = data; steps.push("organização criada");
  } else steps.push("organização já existia");

  const owner = process.env.LAMELLE_OWNER_EMAIL?.trim().toLowerCase();
  const partner = process.env.LAMELLE_PARTNER_EMAIL?.trim().toLowerCase();
  if (!owner) return Response.json({ ok: false, steps, error: "LAMELLE_OWNER_EMAIL não definida na Vercel." }, { status: 500 });
  const base = process.env.LAMELLE_INVITE_REDIRECT_URL?.trim() || "https://lamelle-3d-painel.vercel.app";
  const redirectTo = new URL("/auth/callback", base).toString();

  const { data: list, error: listError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listError) return Response.json({ ok: false, steps, error: `Falha ao listar usuários: ${listError.message}` }, { status: 500 });
  for (const [email, role] of [[owner, "owner"], ...(partner ? [[partner, "member"]] : [])] as [string, "owner" | "member"][]) {
    let user = list.users.find((u) => u.email?.toLowerCase() === email);
    if (!user) {
      const { data, error } = await admin.auth.admin.inviteUserByEmail(email, { redirectTo });
      if (error) { steps.push(`${role}: convite falhou (${error.message})`); continue; }
      user = data.user; steps.push(`${role}: convite enviado`);
    } else steps.push(`${role}: usuário já existia`);
    await admin.from("profiles").upsert({ id: user.id, email, display_name: email.split("@")[0] });
    const { error } = await admin.from("memberships").upsert({ organization_id: org.id, profile_id: user.id, email, role, status: "active", activated_at: new Date().toISOString() }, { onConflict: "organization_id,email" });
    steps.push(error ? `${role}: vínculo falhou (${error.message})` : `${role}: acesso ativo`);
  }
  return Response.json({ ok: true, steps });
}

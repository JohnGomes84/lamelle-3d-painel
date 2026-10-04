import { createHash } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeStatus, plateTotals, pricingSettingsFrom, productMultiplier, syncPayloadSchema } from "@/lib/domain/projects";

export const dynamic = "force-dynamic";

/** Recebe os projetos da pasta Projetos3D (script no PC) e atualiza Projetos + Produtos. */
export async function POST(request: Request) {
  const token = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();
  if (token.length < 32) return Response.json({ error: "Chave de sincronização ausente." }, { status: 401 });
  const hash = createHash("sha256").update(token).digest("hex");

  let admin;
  try { admin = createAdminClient(); } catch { return Response.json({ error: "Servidor sem credenciais administrativas." }, { status: 500 }); }

  const { data: org } = await admin.from("organizations").select("id,settings").eq("settings->>projectsSyncTokenSha256", hash).maybeSingle();
  if (!org) return Response.json({ error: "Chave de sincronização inválida." }, { status: 403 });

  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: "JSON inválido." }, { status: 400 }); }
  const parsed = syncPayloadSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Dados inválidos.", issues: parsed.error.issues.slice(0, 10) }, { status: 422 });

  const settings = pricingSettingsFrom(org.settings);
  const now = new Date().toISOString();
  const report: { slug: string; status: string; products: number; error?: string }[] = [];

  for (const p of parsed.data.projects) {
    const totals = p.plates.length ? plateTotals(p.plates) : { print_minutes: 0, grams: 0 };
    const status = normalizeStatus(p.status, p.status_text);
    const row = {
      organization_id: org.id, slug: p.slug, name: p.name, line: p.line ?? null, status, version: p.version ?? null,
      summary: p.summary ?? null, next_step: p.next_step ?? null, client: p.client ?? null, plates: p.plates,
      print_minutes: totals.print_minutes, grams: totals.grams, unit_cost: p.unit_cost ?? null, price: p.price ?? null,
      files: p.files, folder: p.folder ?? null, source_updated_at: p.source_updated_at ?? null, synced_at: now, updated_at: now,
    };
    const { error } = await admin.from("projects").upsert(row, { onConflict: "organization_id,slug" });
    if (error) { report.push({ slug: p.slug, status, products: 0, error: "Falha ao gravar o projeto." }); continue; }

    let count = 0;
    for (const prod of p.products) {
      const values = {
        organization_id: org.id, project_slug: p.slug, name: prod.name, occasion: prod.occasion ?? p.line ?? null,
        grams: prod.grams, print_minutes: prod.print_minutes, work_minutes: prod.work_minutes, supplies: prod.supplies,
        packaging: prod.packaging, multiplier: productMultiplier(prod, settings), model_license: prod.model_license ?? "Projeto próprio",
        active: true, updated_at: now,
      };
      const { data: existing } = await admin.from("products").select("id").eq("organization_id", org.id).eq("project_slug", p.slug).eq("name", prod.name).maybeSingle();
      const { error: perr } = existing
        ? await admin.from("products").update(values).eq("id", existing.id)
        : await admin.from("products").insert(values);
      if (!perr) count++;
    }
    report.push({ slug: p.slug, status, products: count });
  }

  await admin.from("audit_events").insert({
    organization_id: org.id, action: "sync", entity_type: "projects",
    summary: `Sincronizou ${report.length} projeto(s) da pasta Projetos3D`, after_data: report,
  });
  return Response.json({ ok: true, syncedAt: now, projects: report });
}

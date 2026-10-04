import { createAdminClient } from "@/lib/supabase/admin";
import { orgFromSyncToken } from "@/lib/auth/sync-token";

export const dynamic = "force-dynamic";
const TABLES = ["products", "projects", "inventory_items", "inventory_movements", "clients", "orders", "order_items", "payments", "cash_movements", "production_jobs", "content_items", "partners", "memberships"] as const;

/** Cópia de segurança de todos os dados da organização, baixada pelo script do PC. */
export async function GET(request: Request) {
  let admin;
  try { admin = createAdminClient(); } catch { return Response.json({ error: "Servidor sem credenciais administrativas." }, { status: 500 }); }
  const auth = await orgFromSyncToken(request, admin);
  if (auth.error) return auth.error;
  const data: Record<string, unknown[]> = {};
  const missing: string[] = [];
  for (const table of TABLES) {
    const { data: rows, error } = await admin.from(table).select("*").eq("organization_id", auth.org.id);
    if (error) missing.push(table); else data[table] = rows || [];
  }
  return Response.json({ version: 3, exportedAt: new Date().toISOString(), organization: { id: auth.org.id, slug: auth.org.slug, settings: auth.org.settings }, data, missing });
}

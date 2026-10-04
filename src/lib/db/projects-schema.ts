import postgres from "postgres";

/** Cópia exata de supabase/migrations/0003_projects.sql (o teste garante que não divergem). */
export const PROJECTS_MIGRATION_NAME = "0003_projects.sql";
export const PROJECTS_MIGRATION_SQL = "-- Projetos de impressão (pasta Projetos3D do PC) sincronizados no painel.\ncreate table if not exists public.projects(\n  id uuid primary key default gen_random_uuid(),\n  organization_id uuid not null references public.organizations(id) on delete cascade,\n  slug text not null,\n  name text not null,\n  line text,\n  status text not null default 'Em desenvolvimento',\n  version text,\n  summary text,\n  next_step text,\n  client text,\n  plates jsonb not null default '[]',\n  print_minutes numeric(12,2) not null default 0,\n  grams numeric(12,3) not null default 0,\n  unit_cost numeric(12,2),\n  price numeric(12,2),\n  files jsonb not null default '{}',\n  folder text,\n  source_updated_at timestamptz,\n  synced_at timestamptz not null default now(),\n  created_at timestamptz not null default now(),\n  updated_at timestamptz not null default now(),\n  unique(organization_id, slug)\n);\nalter table public.projects enable row level security;\ndrop policy if exists member_all on public.projects;\ncreate policy member_all on public.projects for all using(public.is_org_member(organization_id)) with check(public.is_org_member(organization_id));\ncreate index if not exists projects_org_status on public.projects(organization_id, status);\n\n-- Produto criado pela sincronização guarda o projeto de origem.\nalter table public.products add column if not exists project_slug text;\ncreate index if not exists products_org_project on public.products(organization_id, project_slug);\n\n-- Chave de sincronização do PC: só o SHA-256 fica no banco; a chave fica no computador do John.\nupdate public.organizations\nset settings = settings || jsonb_build_object('projectsSyncTokenSha256', 'ae9d188073404004d90a21ed7cfe0c5b4fbb1232686bcb5d352f7fe37c5595e8')\nwhere slug = 'lamelle-3d';\n\n-- Faz a API (PostgREST) enxergar a tabela nova na hora.\nnotify pgrst, 'reload schema';\n";

/** Aplica a migração de projetos pelo próprio app quando o build não conseguiu (idempotente). */
export async function ensureProjectsSchema(): Promise<{ ok: true } | { ok: false; error: string }> {
  const urls = [process.env.POSTGRES_URL, process.env.POSTGRES_URL_NON_POOLING].filter(Boolean) as string[];
  if (!urls.length) return { ok: false, error: "Banco sem URL de conexão (POSTGRES_URL) neste ambiente." };
  const errors: string[] = [];
  for (const url of urls) {
    const sql = postgres(url, { max: 1, ssl: "require", prepare: false, connect_timeout: 10 });
    try {
      await sql.begin(async (tx) => {
        await tx.unsafe(PROJECTS_MIGRATION_SQL);
        await tx`create table if not exists public.schema_migrations(name text primary key, applied_at timestamptz not null default now())`;
        await tx`insert into public.schema_migrations(name) values(${PROJECTS_MIGRATION_NAME}) on conflict do nothing`;
      });
      return { ok: true };
    } catch (e) {
      const err = e as { code?: string; message?: string };
      errors.push(`${new URL(url).hostname}: ${err.code || ""} ${err.message || String(e)}`.trim());
    } finally { await sql.end({ timeout: 5 }); }
  }
  return { ok: false, error: errors.join(" | ") };
}

-- Projetos de impressão (pasta Projetos3D do PC) sincronizados no painel.
create table if not exists public.projects(
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  slug text not null,
  name text not null,
  line text,
  status text not null default 'Em desenvolvimento',
  version text,
  summary text,
  next_step text,
  client text,
  plates jsonb not null default '[]',
  print_minutes numeric(12,2) not null default 0,
  grams numeric(12,3) not null default 0,
  unit_cost numeric(12,2),
  price numeric(12,2),
  files jsonb not null default '{}',
  folder text,
  source_updated_at timestamptz,
  synced_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(organization_id, slug)
);
alter table public.projects enable row level security;
drop policy if exists member_all on public.projects;
create policy member_all on public.projects for all using(public.is_org_member(organization_id)) with check(public.is_org_member(organization_id));
create index if not exists projects_org_status on public.projects(organization_id, status);

-- Produto criado pela sincronização guarda o projeto de origem.
alter table public.products add column if not exists project_slug text;
create index if not exists products_org_project on public.products(organization_id, project_slug);

-- Chave de sincronização do PC: só o SHA-256 fica no banco; a chave fica no computador do John.
update public.organizations
set settings = settings || jsonb_build_object('projectsSyncTokenSha256', 'ae9d188073404004d90a21ed7cfe0c5b4fbb1232686bcb5d352f7fe37c5595e8')
where slug = 'lamelle-3d';

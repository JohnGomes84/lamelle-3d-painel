import "dotenv/config";
import { config } from "dotenv";
import postgres from "postgres";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

config({ path: ".env.local", override: false, quiet: true });
const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
if (!connectionString) {
  if (process.argv.includes("--optional")) { process.stdout.write("Migrações puladas: POSTGRES_URL_NON_POOLING não configurada.\n"); process.exit(0); }
  throw new Error("POSTGRES_URL_NON_POOLING não está configurada.");
}
const sql = postgres(connectionString, { max: 1, ssl: "require" });
try {
  await sql`create table if not exists public.schema_migrations(name text primary key, applied_at timestamptz not null default now())`;
  let applied = new Set((await sql`select name from public.schema_migrations`).map((row) => row.name));
  // Banco criado antes do controle de migrações (schema aplicado à mão): registra a base sem reaplicar.
  if (!applied.size) {
    const [{ exists }] = await sql`select to_regclass('public.products') is not null as exists`;
    if (exists) {
      const [{ has_tx }] = await sql`select exists(select 1 from pg_proc where proname = 'create_order_with_items') as has_tx`;
      const base = ["0001_initial_schema.sql", ...(has_tx ? ["0002_order_transactions.sql"] : [])];
      for (const name of base) await sql`insert into public.schema_migrations(name) values(${name}) on conflict do nothing`;
      applied = new Set(base);
      process.stdout.write(`Base existente registrada: ${base.join(", ")}\n`);
    }
  }
  const files = (await readdir("supabase/migrations")).filter((file) => file.endsWith(".sql")).sort();
  for (const file of files) {
    if (applied.has(file)) continue;
    const source = await readFile(path.join("supabase/migrations", file), "utf8");
    await sql.begin(async (tx) => { await tx.unsafe(source); await tx`insert into public.schema_migrations(name) values(${file})`; });
    process.stdout.write(`Aplicada: ${file}\n`);
  }
  process.stdout.write("Migrações atualizadas.\n");
} finally { await sql.end(); }

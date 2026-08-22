import "dotenv/config";
import { config } from "dotenv";
import postgres from "postgres";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

config({ path: ".env.local", override: false, quiet: true });
const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
if (!connectionString) throw new Error("POSTGRES_URL_NON_POOLING não está configurada.");
const sql = postgres(connectionString, { max: 1, ssl: "require" });
try {
  await sql`create table if not exists public.schema_migrations(name text primary key, applied_at timestamptz not null default now())`;
  const applied = new Set((await sql`select name from public.schema_migrations`).map((row) => row.name));
  const files = (await readdir("supabase/migrations")).filter((file) => file.endsWith(".sql")).sort();
  for (const file of files) {
    if (applied.has(file)) continue;
    const source = await readFile(path.join("supabase/migrations", file), "utf8");
    await sql.begin(async (tx) => { await tx.unsafe(source); await tx`insert into public.schema_migrations(name) values(${file})`; });
    process.stdout.write(`Aplicada: ${file}\n`);
  }
  process.stdout.write("Migrações atualizadas.\n");
} finally { await sql.end(); }

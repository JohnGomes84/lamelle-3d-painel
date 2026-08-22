# Desenvolvimento local

1. Instale Node.js 24 ou superior e pnpm.
2. Execute `pnpm install`.
3. Copie `.env.example` para `.env.local` e preencha apenas no arquivo local.
4. Vincule o projeto com `vercel link` e, depois que Supabase estiver integrado, execute `vercel env pull .env.local --yes`.
5. Aplique as migrações da pasta `supabase/migrations` ao projeto Supabase.
6. Execute `pnpm dev` e abra `http://localhost:3000`.

Nunca envie `.env.local` ao Git. Use `pnpm check` e `pnpm build` antes de publicar mudanças.

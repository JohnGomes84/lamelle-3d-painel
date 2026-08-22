# Produção

- Projeto Vercel: `johneug-5884s-projects/lamelle-3d-painel`.
- Repositório: `JohnGomes84/lamelle-3d-painel`.
- `main` representa produção; branches geram ambientes de prévia.
- Supabase fornece autenticação e PostgreSQL.
- Variáveis obrigatórias estão listadas em `.env.example`.

Antes da primeira liberação:

1. concluir a integração Supabase no Marketplace da Vercel;
2. aplicar `0001_initial_schema.sql` e `0002_order_transactions.sql`;
3. definir os e-mails da proprietária e da sócia;
4. criar a organização Lamelle 3D e os dois vínculos;
5. confirmar login, isolamento por organização, pedido, pagamento, caixa e exportação em Preview;
6. promover somente após `pnpm check` e `pnpm build` passarem.

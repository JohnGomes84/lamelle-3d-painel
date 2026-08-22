# Lamelle 3D · Painel operacional

Ferramenta offline, em um único HTML, para administrar produtos, precificação, estoque, clientes, pedidos, produção, conteúdo, parceiros e fluxo de caixa da Lamelle 3D.

O repositório também contém a evolução para aplicativo privado na nuvem em Next.js, com Supabase e Vercel. O aplicativo mantém o HTML offline como fallback e adiciona duas contas, dados compartilhados, organização, auditoria, pedidos e pagamentos conectados ao caixa.

## Abrir o painel

Abra `outputs/painel-lamelle-3d.html` no Chrome ou Microsoft Edge. Não é necessário instalar nada nem iniciar um servidor.

Os dados operacionais ficam no `localStorage` do navegador. Para levar os dados para outro computador, use **Ajustes & backup → Exportar backup JSON** no computador atual e **Importar JSON** no novo computador. O Git sincroniza o código do painel, mas não copia automaticamente os dados salvos pelo navegador.

## Verificação

Com Node.js instalado:

```powershell
node work/lamelle-core.test.js
node work/painel-structure.test.js
```

Para o aplicativo na nuvem:

```powershell
pnpm install
pnpm check
pnpm build
```

Consulte `docs/LOCAL-DEVELOPMENT.md` e `docs/PRODUCTION.md`.

## Estrutura

- `outputs/painel-lamelle-3d.html`: ferramenta pronta para uso.
- `work/lamelle-core.js`: funções de cálculo e validação usadas nos testes.
- `work/*.test.js`: testes automatizados.
- `docs/superpowers/specs`: especificação funcional.
- `docs/superpowers/plans`: plano de implementação.

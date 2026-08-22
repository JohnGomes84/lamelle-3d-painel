# Lamelle 3D Cloud Application Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a private two-user cloud application for Lamelle 3D with shared operational data and a future-compatible organization boundary.

**Architecture:** A Next.js App Router application uses Supabase email authentication and PostgreSQL with row-level security. Every operational record belongs to an organization; server-side mutations validate membership and write audit events. The existing standalone HTML remains under `outputs/` as an offline fallback and import source.

**Tech Stack:** Next.js, React, TypeScript, Supabase Auth/PostgreSQL, Zod, Vitest, Playwright, Vercel.

**Spec:** `docs/superpowers/specs/2026-08-22-lamelle-cloud-app-design.md`

## Global Constraints

- Initial access is limited to two invited email addresses in one Lamelle 3D organization.
- No public signup, billing, subscriptions, native app, or PWA installation in this release.
- All operational tables include `organization_id` and row-level security.
- The `main` branch is production; feature branches use preview environments.
- Secrets never enter Git or client bundles.
- The existing `outputs/painel-lamelle-3d.html` remains available as an offline fallback.
- Currency is BRL, dates are presented in Brazilian format, and monetary database fields use fixed decimal types.

---

### Task 1: Bootstrap the tested application shell

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `vitest.config.ts`, `eslint.config.mjs`, `.env.example`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
- Create: `src/components/app-shell.tsx`, `src/components/brand-mark.tsx`
- Create: `src/app/app-shell.test.tsx`

**Interfaces:**
- Produces: root layout, Lamelle visual tokens, responsive authenticated-shell placeholder, `npm` scripts for development/build/check/test.

- [ ] Write a failing component test that renders the masthead, Lamelle logo, navigation landmark, and main content landmark.
- [ ] Run the test and verify it fails because the app shell does not exist.
- [ ] Add the minimal Next.js/TypeScript/Vitest configuration and implement the shell using the existing palette, typography fallbacks, and layer signature.
- [ ] Run tests, type checks, and lint until green.

### Task 2: Create database schema, generated types, and organization isolation

**Files:**
- Create: `supabase/migrations/0001_initial_schema.sql`
- Create: `supabase/seed.sql`
- Create: `src/lib/database.types.ts`
- Create: `src/lib/supabase/server.ts`, `src/lib/supabase/client.ts`, `src/lib/supabase/middleware.ts`
- Create: `src/lib/auth/authorization.ts`, `src/lib/auth/authorization.test.ts`
- Create: `middleware.ts`

**Interfaces:**
- Produces: `requireUser()`, `requireMembership()`, `requireOwner()`, typed Supabase clients, organization-scoped tables and RLS policies.

- [ ] Write failing authorization tests for anonymous rejection, inactive-member rejection, member access, and owner-only actions.
- [ ] Run tests and confirm missing authorization behavior.
- [ ] Define identity, membership, operational, payment, inventory, audit, trigger, index, and RLS SQL.
- [ ] Implement typed clients and server authorization helpers.
- [ ] Apply the migration to a local Supabase instance or validate it with the available database tooling.
- [ ] Run tests and checks until green.

### Task 3: Implement authentication and private invitation gating

**Files:**
- Create: `src/app/(auth)/login/page.tsx`, `src/app/(auth)/auth/callback/route.ts`
- Create: `src/app/(protected)/layout.tsx`, `src/app/(protected)/unauthorized/page.tsx`
- Create: `src/components/auth/login-form.tsx`, `src/components/auth/user-menu.tsx`
- Create: `src/lib/auth/actions.ts`, `src/lib/auth/actions.test.ts`

**Interfaces:**
- Consumes: Supabase clients and membership helpers.
- Produces: email login action, callback flow, logout, membership gate, and two-email invitation workflow.

- [ ] Write failing tests for invalid email, email outside the invitation list, active member, and logout.
- [ ] Run tests and confirm expected failures.
- [ ] Implement login/callback/logout and protected layout; expose no public signup route.
- [ ] Run tests and checks until green.

### Task 4: Port the domain calculation and validation core

**Files:**
- Create: `src/lib/domain/pricing.ts`, `src/lib/domain/orders.ts`, `src/lib/domain/production.ts`, `src/lib/domain/finance.ts`, `src/lib/domain/import.ts`
- Create: matching `*.test.ts` files under `src/lib/domain/`

**Interfaces:**
- Produces: `priceProduct`, `volumeDiscountRate`, `calculateOrder`, `sortProductionJobs`, `monthlySummary`, `parseLegacyBackup`.

- [ ] Port existing JavaScript expectations into failing TypeScript tests, adding below-floor price warnings, payment reversal, and import-size/version validation.
- [ ] Run tests and confirm failures are caused by missing TypeScript implementations.
- [ ] Implement pure functions with fixed-decimal-safe boundaries and Zod schemas.
- [ ] Run tests until green and confirm parity with the offline HTML calculations.

### Task 5: Build dashboard and reusable operational UI

**Files:**
- Create: `src/app/(protected)/dashboard/page.tsx`
- Create: `src/components/ui/button.tsx`, `card.tsx`, `data-table.tsx`, `dialog.tsx`, `empty-state.tsx`, `field.tsx`, `status-tag.tsx`
- Create: `src/components/dashboard/monthly-kpis.tsx`, `deadline-list.tsx`, `capacity-card.tsx`
- Create: `src/app/(protected)/dashboard/page.test.tsx`

**Interfaces:**
- Consumes: authenticated organization and monthly finance domain function.
- Produces: responsive module navigation and dashboard components used by later modules.

- [ ] Write failing tests for monthly KPIs, receivables, next deliveries, low stock, and printer capacity warnings.
- [ ] Run tests and confirm expected failures.
- [ ] Implement accessible shared UI and organization-scoped dashboard queries.
- [ ] Run tests, lint, and type checks until green.

### Task 6: Products, pricing, and inventory

**Files:**
- Create: `src/app/(protected)/products/page.tsx`, `actions.ts`, `product-form.tsx`
- Create: `src/app/(protected)/inventory/page.tsx`, `actions.ts`, `inventory-form.tsx`, `movement-form.tsx`
- Create: action tests for both modules.

**Interfaces:**
- Produces: create/update/archive product actions, live pricing worksheet, inventory item actions, append-only inventory movement actions, low-stock status.

- [ ] Write failing action tests for organization scoping, pricing-floor override, archive behavior, stock movement, and insufficient-stock prevention.
- [ ] Run tests and confirm expected failures.
- [ ] Implement server actions, forms, tables, and audit events.
- [ ] Run tests and checks until green.

### Task 7: Clients, orders, payments, production, and cash linkage

**Files:**
- Create: `src/app/(protected)/clients/*`, `orders/*`, `production/*`, `finance/*`
- Create: `src/lib/services/order-service.ts`, `payment-service.ts`, `production-service.ts`
- Create: matching service and action tests.

**Interfaces:**
- Produces: client CRUD, order item snapshots, deposit/balance/profit calculation, atomic payment and cash linkage, payment reversal, production queue and manual audited override, cash-entry actions.

- [ ] Write failing tests for order snapshots, automatic discounts, deposit gating, atomic payment/cash creation, reversal, priority queue, and monthly cash derivation.
- [ ] Run tests and confirm expected failures.
- [ ] Implement transactional database functions/services and module interfaces.
- [ ] Run tests and checks until green.

### Task 8: Content, partners, members, and audit history

**Files:**
- Create: `src/app/(protected)/content/*`, `partners/*`, `settings/members/*`, `settings/audit/*`
- Create: action tests for each module.

**Interfaces:**
- Produces: content metrics management, partner pipeline, owner-only membership management, and audit timeline.

- [ ] Write failing tests for content metrics, partner stages, member-vs-owner permissions, and append-only audit events.
- [ ] Run tests and confirm expected failures.
- [ ] Implement scoped actions and responsive interfaces.
- [ ] Run tests and checks until green.

### Task 9: Backup import, JSON export, and CSV export

**Files:**
- Create: `src/app/(protected)/settings/backup/page.tsx`, `actions.ts`, `backup-form.tsx`
- Create: `src/lib/services/backup-service.ts`, `backup-service.test.ts`
- Create: `src/app/api/export/[area]/route.ts`

**Interfaces:**
- Produces: previewed/import-confirmed legacy backup transaction, organization JSON export, per-module CSV routes, owner-only restore.

- [ ] Write failing tests for invalid version, oversized payload, cross-organization ID rejection, idempotent stable IDs, preview counts, JSON exclusion of auth secrets, and CSV quoting.
- [ ] Run tests and confirm expected failures.
- [ ] Implement import preview/transaction, export routes, typed confirmation, and audit events.
- [ ] Run tests and checks until green.

### Task 10: Local/prod configuration, end-to-end verification, and deployment

**Files:**
- Create: `playwright.config.ts`, `e2e/private-app.spec.ts`
- Create: `docs/LOCAL-DEVELOPMENT.md`, `docs/PRODUCTION.md`
- Modify: `README.md`, `.gitignore`

**Interfaces:**
- Consumes: complete application and configured Supabase/Vercel projects.
- Produces: reproducible local setup, preview deployment, production deployment, and two-user smoke verification.

- [ ] Write failing browser tests for login gate, dashboard, product creation, order/payment linkage, shared second-user visibility, and export.
- [ ] Run tests and confirm missing environment/application failures.
- [ ] Configure local and cloud environment variables, database migrations, two invited users, and deployment project.
- [ ] Run unit/integration suite, lint, type check, production build, database/RLS tests, and browser tests.
- [ ] Deploy preview and verify both accounts; then merge/push production and verify health.

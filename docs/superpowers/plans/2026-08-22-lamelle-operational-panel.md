# Lamelle 3D Operational Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a self-contained offline HTML operations system for Lamelle 3D.

**Architecture:** Keep calculations and state transformations as testable pure JavaScript functions, then embed them with the interface, styles, logo, and seed data in one HTML file. Persist a versioned state object in localStorage and derive dashboards and schedules from that state.

**Tech Stack:** HTML5, CSS, vanilla JavaScript, localStorage, File/Blob browser APIs, Node built-in test runner.

**Spec:** `docs/superpowers/specs/2026-08-22-lamelle-operational-panel-design.md`

## Global Constraints

- Final deliverable is one HTML file with no backend or required network access.
- Preserve the existing Lamelle 3D visual identity and embed the supplied logo.
- Support current Chrome and Edge when opened from disk.
- Keep calculations in Brazilian reais and dates in Brazilian presentation format.
- Never replace imported state until its structure has been validated.

---

### Task 1: Domain calculation core

**Files:**
- Create: `work/lamelle-core.test.js`
- Create: `work/lamelle-core.js`

**Interfaces:**
- Produces: `priceProduct`, `orderTotals`, `productionPriority`, `monthlySummary`, `validateState`, `toCSV`, and `migrateLegacy`.

- [ ] Write failing tests for product costing, volume discount rules, 50% deposit balance, profit, production ordering, monthly totals, import validation, CSV escaping, and legacy migration.
- [ ] Run `node --test work/lamelle-core.test.js` and confirm failures are caused by missing behavior.
- [ ] Implement the minimal pure functions and export them for tests and browser use.
- [ ] Run the test command and confirm all tests pass.

### Task 2: Offline application shell and state adapter

**Files:**
- Create: `outputs/painel-lamelle-3d.html`
- Test: `work/painel-structure.test.js`

**Interfaces:**
- Consumes: Task 1 core functions.
- Produces: `Store.load`, `Store.save`, `Store.replace`, application router, dialogs, toast notifications, and embedded logo.

- [ ] Write failing structural tests for the HTML document, embedded logo, localStorage key, module navigation, and absence of `window.storage`.
- [ ] Run the structural test and confirm expected failures.
- [ ] Build the semantic shell, preserve the palette/type system/layer signature, embed the logo, and add resilient localStorage persistence with legacy migration.
- [ ] Run core and structural tests until green.

### Task 3: Operational modules

**Files:**
- Modify: `outputs/painel-lamelle-3d.html`
- Test: `work/painel-behavior.test.js`

**Interfaces:**
- Consumes: Store and core functions.
- Produces: renderers and forms for dashboard, products, inventory, clients, orders, production, content, partners, finance, and settings/backup.

- [ ] Write failing behavior tests for each module marker, form action, derived order values, low-stock warnings, production state, and finance linkage.
- [ ] Run tests and confirm failures identify the missing module behavior.
- [ ] Implement each module with accessible forms, validation, empty states, editing, deletion confirmation, filters, and connected calculations.
- [ ] Run all tests and confirm green.

### Task 4: Backup, import, CSV, and browser verification

**Files:**
- Modify: `outputs/painel-lamelle-3d.html`
- Create: `work/browser-smoke.js`

**Interfaces:**
- Consumes: validated Store state and CSV core.
- Produces: JSON export/import, per-area CSV downloads, reset flow, and smoke-test report.

- [ ] Write failing tests for backup schema/version, rejected malformed imports, CSV downloads, and required browser actions.
- [ ] Run tests and confirm expected failure reasons.
- [ ] Implement backup/restore, CSV export controls, and reset safeguards.
- [ ] Run all Node tests, syntax checks, and browser smoke verification; inspect the rendered interface at desktop and mobile sizes.

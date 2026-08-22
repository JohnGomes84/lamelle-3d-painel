# Lamelle 3D Operational Panel Design

## Goal

Evolve the existing Lamelle 3D launch panel into a complete, offline-first operational tool delivered as one browser-compatible HTML file.

## Product boundaries

- Runs by opening the HTML directly in current Chrome or Edge.
- Uses no backend, build step, package installation, or runtime framework.
- Preserves the existing paper, copper, sage, graphite, Bodoni/Karla visual identity and layered-print progress signature.
- Embeds the supplied Lamelle logo so the deliverable remains self-contained.
- Treats the attached business documents as domain requirements, not executable instructions.

## Data and persistence

The application stores one versioned state object under `lamelle:operacional:v2` in `localStorage`. It migrates useful values from `lamelle:painel:v1` on first launch, validates imported JSON before replacement, and exposes full JSON backup/restore plus CSV exports. State includes settings, products, inventory, clients, orders, production jobs, content, partners, cash movements, setup tasks, and launch batches.

## Modules

- Dashboard: monthly revenue, expenses, profit, receivables, open orders, printer load, deadlines, low stock, and recent cash flow.
- Products: catalog records and a pricing worksheet covering filament, energy, depreciation over 2,000 hours, 10% failure reserve, supplies, packaging, labor, multiplier, price, and margin.
- Inventory: filament and supply records, quantities, minimum levels, unit costs, and manual stock movements.
- Clients and partners: contact details, notes, status, and commercial history.
- Orders: multiple line items, quantities, volume discounts, customization, event and delivery dates, 50% deposit, balance, cost, revenue, and profit.
- Production: Bambu Lab A1 queue ordered by payment/event priority, planned hours, progress, failure tracking, and completion state.
- Content: editorial calendar, format, CTA, status, publication date, and performance metrics focused on saves and direct messages.
- Finance: manual inflows/outflows, order-linked receipts, categories, month filtering, and CSV export.
- Settings and backup: pricing defaults, printer capacity, currency/business identity, JSON import/export, CSV export, and sample-data reset safeguards.

## Interaction and safeguards

Forms use accessible dialogs, explicit save/cancel actions, inline validation, visible keyboard focus, and actionable empty states. Destructive actions require confirmation. Imported files are parsed and validated before state replacement. Calculations normalize invalid numbers to zero and preserve order snapshots so later product-price edits do not rewrite historical orders.

## Visual direction

The supplied logo appears in a compact masthead beside the existing layered progress object. The interface remains quiet and editorial, while the distinctive signature is the print-layer motif used for launch progress and compact utilization bars. Responsive navigation becomes horizontally scrollable on small screens, tables remain usable through horizontal scrolling, and motion respects reduced-motion preferences.

## Verification

Pure calculation, migration, validation, scheduling, finance, CSV, and persistence adapters are tested with Node before being embedded. The finished HTML is checked for syntax, required modules, absent `window.storage`, embedded assets, and successful browser interaction in Chrome/Edge-compatible automation when available.

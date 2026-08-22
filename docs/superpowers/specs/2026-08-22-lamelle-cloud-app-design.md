# Lamelle 3D Cloud Application Design

## Objective

Replace the single-file operational panel as the primary system with a private cloud application for the two Lamelle 3D partners. Both users share the same operational data through a browser in development and production environments. The architecture supports future public registration, subscriptions, and additional companies without exposing or implementing those features now.

## Scope for the first cloud release

The release includes:

- private email authentication for exactly two invited users;
- one shared Lamelle 3D organization;
- dashboard, products and pricing, inventory, clients, orders, production, content, partners, cash flow, settings, JSON backup, and CSV exports;
- import of a backup created by the existing HTML panel;
- an audit trail identifying who created or changed operational records;
- local development and a production deployment connected to GitHub;
- responsive browser access without PWA installation requirements.

The release excludes public registration, plan selection, billing, subscription management, public marketing pages, native mobile applications, and customer-facing portals.

## Architecture

### Application

The application uses the Next.js App Router with TypeScript. Server Components read initial data and Server Actions or route handlers perform validated mutations. Interactive forms use Client Components only where browser state is necessary. The existing paper, copper, sage, graphite, serif-display identity and print-layer progress signature remain the visual foundation.

### Hosting and environments

Vercel hosts preview and production deployments. The `main` branch represents production. Feature branches create isolated previews. Local development uses `.env.local`; production and preview credentials are stored in their respective Vercel environments. No secrets are committed.

### Data and authentication

Supabase provides PostgreSQL and email authentication. Each authenticated user has a profile and belongs to an organization through a membership record. All operational tables carry `organization_id`. Row-level security restricts reads and writes to active organization members. In the first release, only the two explicitly invited email addresses may enter the application.

This organization boundary is retained even though only Lamelle 3D exists initially. Future onboarding can create additional organizations without redesigning operational records. Public signup and billing remain absent from routes and interface.

### Authorization

Roles are `owner` and `member`. Both initial users can use operational modules. Only the owner can change organization settings, invite or deactivate a member, restore a full backup, or run a destructive reset. Server-side authorization is required for every mutation; hiding a control in the interface is not sufficient authorization.

## Data model

### Identity and tenancy

- `organizations`: name, slug, status, settings, timestamps.
- `profiles`: auth user reference, display name, email, timestamps.
- `memberships`: organization, profile, role, status, invited/activated timestamps.

### Operations

- `products`: catalog identity, occasion, production inputs, pricing multiplier, computed-price snapshot fields, model license, active status.
- `inventory_items`: type, category, color, unit, quantity, minimum, unit cost.
- `inventory_movements`: item, direction, quantity, reason, optional order or production reference.
- `clients`: contact fields and notes.
- `orders`: code, client, status, event and delivery dates, totals, paid amount, balance, cost, profit, customization notes.
- `order_items`: product snapshot, quantity, individualized flag, unit price, unit cost, discount, totals.
- `payments`: order, date, amount, method, cash-movement reference.
- `production_jobs`: optional order and order-item references, job type, priority, event date, quantity, planned hours, status, failures, queue position.
- `content_items`: week, title, format, CTA, dates, status, reach, saves, and direct messages.
- `partners`: type, contact, stage, last contact, and notes.
- `cash_movements`: date, direction, category, description, amount, optional order/payment reference.
- `audit_events`: actor, organization, action, entity type, entity id, summary, before/after snapshots, timestamp.

Every operational record has `organization_id`, `created_at`, `updated_at`, and actor fields where useful. Monetary values use fixed decimal database types and integer-safe transformations at application boundaries.

## Domain rules

### Pricing

Product cost includes filament, energy at 0.15 kWh per print hour, printer depreciation over its configured useful life, a 10% failure reserve over filament/energy/depreciation, supplies, packaging, and labor. The default sale price is total cost multiplied by 3. The interface warns below 2.5 and requires an explicit owner override for prices below that floor.

### Orders and payments

Orders contain product snapshots so later catalog edits do not rewrite history. Identical items receive the documented volume discounts: 10% for 10–29, 15% for 30–59, and 20% for 60 or more. Individually personalized units do not receive an automatic volume discount. The minimum deposit is 50%. An order cannot enter the paid production priority until recorded payments reach the deposit threshold.

A payment atomically updates the order balance and creates its linked cash entry. Removing or reversing a payment must reverse the linked cash effect and create an audit event.

### Production

The default printer is Bambu Lab A1 with a configurable weekly capacity starting at 40 hours. Queue priority is paid order with the nearest event date, paid order with more time, unpaid order, portfolio/content, then rotating stock. Users may manually reorder jobs, and the override is audited. Capacity warnings do not silently reject a job.

### Inventory and finance

Inventory changes are represented by movements rather than direct quantity replacement. Production consumption may initially be confirmed manually. Cash flow distinguishes realized entries and exits from order receivables. Monthly dashboards derive totals from payments and cash movements rather than order status alone.

## User experience

The authenticated shell has a compact desktop navigation and responsive small-screen layout. The monthly dashboard opens first. Each module provides searchable tables, clear empty states, create/edit dialogs or pages, validation feedback, loading feedback, and confirmation for destructive actions.

The supplied Lamelle logo appears in the application masthead. The distinctive layer object visualizes launch or monthly operational completion. The design uses the existing colors and typography with local/system fallbacks when a web font is unavailable.

## Import, export, and backup

An owner can upload the `version: 2` JSON produced by the HTML panel. Import first validates the complete file and presents record counts. The owner confirms before a transaction inserts or merges data into the Lamelle organization. Import is idempotent where stable IDs exist and records one audit event with counts and source metadata.

JSON export contains organization-owned operational data but excludes auth secrets. CSV exports are available per module. Restoring a full backup is owner-only and requires an explicit typed confirmation.

## Error handling and observability

All mutations validate input on the server and return field-level errors. Database constraint or authorization errors produce safe user messages without exposing credentials or SQL details. Critical actions and failed imports are logged. Production health includes a lightweight authenticated database check; no customer operational data appears in logs.

## Security

- Row-level security protects every organization-owned table.
- Server-side membership checks protect every mutation.
- The two initial emails are invited explicitly; no public signup route exists.
- Environment secrets remain outside Git and browser bundles.
- Backup import rejects unknown versions, oversized files, malformed collections, and cross-organization identifiers.
- Audit records are append-only to ordinary members.

## Future evolution

The organization and membership model allows later public signup, organization creation, invitations, plan entitlements, billing accounts, subscriptions, and usage limits. Those concepts may be added in new tables and routes; no placeholder screens, fake billing state, or unused subscription code ships in the first release.

## Testing and release criteria

- Unit tests cover pricing, discounts, payment/balance behavior, priority ordering, import validation, and monthly summaries.
- Database tests cover membership isolation and row-level security between two organizations.
- Integration tests cover login gating, product creation, order creation, payment-to-cash linkage, inventory movement, and backup import.
- Browser tests cover the two-user critical path in local and preview environments.
- Production release requires passing checks, successful database migrations, a tested preview, and a verified production health check.

## Migration and rollout

The existing HTML remains in the repository as an offline fallback. The cloud application is built alongside it, imports a fresh JSON backup for initial data, and becomes the primary system only after both partners confirm login, shared updates, order/payment behavior, and exports in production.

# AGENTS.md — Project ROZANA (working codename, not the brand)

## Read first, every session
1. Read docs/STATUS.md, then docs/DECISIONS.md.
2. Do only the next unchecked item in docs/ROADMAP.md unless the owner says otherwise.
3. Before ending: update docs/STATUS.md (done, in progress, next, blockers).
4. Never put secrets or keys in this file, in docs/ or in git. Public settings go in
   .env.local; secret keys only in .env.secrets (D32: .env.local ships to the live site).
5. Two people work here: use a branch and a pull request, never push to main directly
   (CONTRIBUTING.md).

## Product
Multi-tenant SaaS for daily-supply wholesalers who also run a shop
(first tenant: a bakery and dairy wholesaler). Core loop:
standing order -> evening edits -> morning packing list -> delivery route
-> delivered/collected -> credit ledger (khata).
Promises: no per-order commission, human support in Hindi, daily backups + export.

## Surfaces and roles
- super_admin: tenants, plans, 15-day trials, coupons, sales, usage, billing
- merchant_admin / merchant_staff: catalogue, customers, price lists, orders,
  inventory, ledger, theme
- delivery: today's route, mark delivered, record cash/UPI collected
- customer: tenant storefront (PWA), order, standing order, statement

## Stack (confirm in docs/DECISIONS.md before changing)
Next.js App Router + TypeScript + Tailwind | Supabase Postgres + Auth + Storage
Cloudflare hosting | tenant by subdomain | PWA first, no native app yet
Payments: merchant's own UPI QR + COD + ledger; platform never holds merchant money
SaaS billing: manual UPI first, Razorpay Subscriptions later
Messaging: wa.me links first, WhatsApp Cloud API later (metered per plan)
Automation: self-hosted n8n behind the scenes; customers never see the editor

## Hard rules
- Every tenant table has tenant_id and a row-level security policy. No exceptions.
- Money is stored as integer paise. Ledger entries are append-only.
- All plan limits and feature flags come from the plans table, never hard-coded.
- UI: Hindi and English labels, large touch targets, works on a ₹8,000 Android phone
  on slow data. Theme only through per-tenant tokens (colours, logo, fonts, preset).
- UI must not look templated: no gradient heroes, no glass cards, no emoji icons.
  Model screens on the merchant's real bill book and rate list.

## Data model (sketch)
tenants, plans, subscriptions, coupons, memberships(user, tenant, role),
customers, price_lists, price_list_items, products, inventory_movements,
standing_orders, orders, order_items, deliveries, ledger_entries, payments,
message_log, automations

## Roadmap (mirror of docs/ROADMAP.md)
- [ ] M0 Repo, auth, tenant model + RLS, super admin: create tenant, set plan/trial
- [ ] M1 Catalogue, customers + price lists, storefront ordering, standing orders,
      nightly order generation, morning packing list
- [ ] M2 Delivery view, delivered/collected, ledger, UPI QR, statement link
- [ ] M3 Two-week live pilot with the bakery; fix what breaks
- [ ] M4 Plans, trial expiry, coupons, tenant theming, website add-on
- [ ] M5 Inventory, GST invoice, reports, backups + export
- [ ] M6 Automation add-ons, WhatsApp API, Razorpay Subscriptions

## Docs
docs/STATUS.md  docs/DECISIONS.md  docs/ROADMAP.md
docs/RESEARCH.md (competitors, complaints, costs)  docs/PRICING.md  docs/GTM.md
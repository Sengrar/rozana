# DECISIONS

Status key: PROPOSED = suggested, owner has not confirmed yet.
CONFIRMED = owner agreed. Change a confirmed decision only with the owner's say.
Add new entries at the bottom with a date and a one-line reason.

## Product
- D1 PROPOSED: Core feature is the daily repeat-order loop
  (standing order -> evening edits -> packing list -> route -> collection -> ledger).
  Reason: no competitor under ₹2,000/month combines these.
- D2 CONFIRMED: Launch vertical is daily-supply wholesalers (bakery, dairy, eggs,
  water, vegetables). Architecture stays multi-tenant and generic.
  Reason: a narrow pitch sells; a generic "for every shop" pitch does not.
- D3 PROPOSED: Four surfaces: super admin, merchant admin, delivery, customer.
- D4 PROPOSED: No per-order commission, ever. Flat subscription only.
  Reason: per-order fees are a top complaint against competitors.

## Tech
- D5 PROPOSED: Next.js (App Router) + TypeScript + Tailwind.
- D6 CONFIRMED: Supabase Postgres + Auth + Storage. tenant_id on every table,
  row-level security on every table.
- D7 PROPOSED: Host on Cloudflare, not Vercel.
  Reason: Vercel's free plan forbids commercial use; Cloudflare's allows it.
- D8 CONFIRMED (revised 2026-11-10): Installable web app (PWA) from day one.
  At M4, publish one Play Store app under our brand that wraps the same web app,
  for merchants and delivery staff. Customers use the merchant's storefront as
  an installable PWA. A separately branded Play Store app per merchant is a
  paid add-on later. Reason: one codebase; per-merchant listings each need
  their own build, review and updates.
- D9 PROPOSED: Tenant per subdomain. Custom domain is a Pro plan feature.
- D10 PROPOSED: Theming through per-tenant tokens only
  (colours, logo, font pair, layout preset).

## Money
- D11 PROPOSED: The platform never holds merchants' money.
  MVP: merchant's own UPI QR, cash on delivery, credit ledger.
  Later: merchant connects their own Razorpay account.
  Reason: only RBI-authorised payment aggregators may handle merchant funds.
- D12 PROPOSED: SaaS subscription collected manually by UPI for the first ~20
  merchants; plan switched in super admin. Razorpay Subscriptions after that.
- D13 PROPOSED: Trials (15 days), coupons and sales are created only in super admin.

## Messaging and automation
- D14 PROPOSED: WhatsApp click-to-chat links (free) in MVP. WhatsApp Cloud API
  later, with a message quota per plan and paid top-ups.
- D15 PROPOSED: Self-hosted n8n behind the scenes for automation add-ons.
  Customers never see or edit workflows.
  OPEN: email license@n8n.io to confirm storing client credentials on our
  instance is covered, before selling any automation.
- D16 CONFIRMED 2026-11-10: Three order types in one orders table: standing
  (generated nightly), one-time (any future date), same-day (accepted until a
  time the merchant sets). Every order records its source: standing, storefront,
  public link, or entered by merchant (phone orders).
- D17 CONFIRMED 2026-11-10: Each tenant has a public store link and a printable
  QR poster. New customers self-register with a phone number and see retail
  prices. Merchant approval is required for wholesale prices or credit; until
  then orders are prepaid or cash on delivery.
- D18 CONFIRMED 2026-11-10: Build tool is Claude Code in the project folder.

## Build setup (M0)
- D19 PROPOSED 2026-11-10: Versions: Next.js 16.4.6, React 19.3.1, TypeScript 5.9,
  Tailwind CSS 4.3.5, ESLint 10, Prettier 3.9, @supabase/ssr 0.12.7,
  @supabase/supabase-js 2.119.0. Deploy (step 6): @opennextjs/cloudflare 1.20.16,
  wrangler 4.159.0. Reason: latest stable on 2026-11-10; the Cloudflare adapter
  needs Next.js 16.4.5+ (Next.js security release of 3 Nov 2026).
- D20 PROPOSED 2026-11-10: Use `middleware.ts` (edge runtime), not Next.js 16's
  `proxy.ts`. Reason: the Cloudflare adapter marks `proxy.ts` as experimental;
  `middleware.ts` is deprecated but supported in 16.x. Revisit before Next.js 17.
- D21 PROPOSED 2026-11-10: Next.js Cache Components switched off. Reason: almost
  every page depends on the signed-in user or the shop; it adds Suspense rules
  without a speed gain. Revisit before Next.js 17, where it becomes the default.
- D22 PROPOSED 2026-11-10: Real Next.js + OpenNext adapter on Cloudflare, not
  Cloudflare's new "vinext". Reason: vinext is in beta; the adapter supports every
  Next.js 16 release and keeps us able to move hosts.
- D23 PROPOSED 2026-11-10: Supabase publishable and secret keys, not the legacy
  anon/service_role keys (Supabase retires those by end of 2026). The deployed app
  gets only the publishable key; the secret key is for tests and scripts only.
- D24 PROPOSED 2026-11-10: System fonts only; no web-font download. Reason: Android
  ships Noto Sans Devanagari, so Hindi renders well with zero bytes on slow data.
- D25 PROPOSED 2026-11-10: Staff login is email + password for now; accounts are
  created by us and public sign-up is off in Supabase. Reason: Supabase's built-in
  mailer sends only ~2 emails/hour, so emailed login links need our own SMTP first.
  Customer login (O3) is decided separately in M1.
- D26 PROPOSED 2026-11-10: Migration 0002 adds two super-admin functions:
  admin_list_members (a shop's people with emails) and admin_set_member (give an
  existing login a role in a shop). Functions only; no table or policy changes.
  Reason: the app cannot read auth.users, and the secret key stays out of the app.

## Product scope (owner's answers, 2026-11-10)
- D27 CONFIRMED 2026-11-10 (closes O3): Customers log in by opening the shop's
  link or a personal link the shop sends on WhatsApp; that phone stays logged in.
  No OTP, no SMS cost. New customers give name and phone; credit and wholesale
  prices still need the shop's approval (D17). Reason: GTM promise "it opens from
  a WhatsApp link, nothing to install".
- D28 CONFIRMED 2026-11-10 (closes O5): One app for all shops at app.<domain>,
  used by owners, staff and delivery boys (one install; matches the Play Store
  wrapper in D8). Customers use <shop>.<domain>. The main domain is our own
  website; login and super admin move to app.<domain>.
- D29 CONFIRMED 2026-11-10: Finish M0 (subdomains, isolation test, Cloudflare
  deploy) before M1. Then build milestone by milestone, showing the owner each step.
  The "mobile app" is the installable web app of D8, for owners and customers.
- D30 CONFIRMED 2026-11-10: Website add-on, sold for a one-time fee in three tiers;
  offers can apply. Mini: one page on the shop's address (about, timings, map,
  rate list, photos, WhatsApp/call buttons). Pro website: Mini + custom domain +
  enquiry form. Mini and Pro website on any plan. Ultra: website joined to the
  platform; needs the Pro plan or higher. Prices to be set in PRICING.md.
  Claude's reading of the owner's words; correct it if wrong.
  Open: who pays the custom domain's yearly renewal; what happens to a website
  when the subscription lapses or the plan drops below Pro.

## Deploy (M0 step 6)
- D31 PROPOSED 2026-11-10: Until the domain exists, the live site runs on
  workers.dev with everything on one address (shops at /shop/<shop>); the domain
  is switched on later with routes and package.json "rootDomain" (docs/DEPLOY.md).
  No page cache (pages render on request). Deploys go through
  scripts/cloudflare.mjs. Reason: the adapter copies all .env files into the
  uploaded site, so the script blocks secrets, and the "&" in the folder name
  breaks the adapter's way of starting wrangler on Windows.
- D32 PROPOSED 2026-11-10: The Supabase secret key lives only in .env.secrets
  (tests), never in .env.local. Reason: .env.local is copied into the live site.

## Open decisions
- O1 Brand name (short, Hindi, easy to say on the phone)
- O2 Final plan prices after testing with the first five merchants
- O3 Login method for customers: decided 2026-11-10, see D27
- O4 When to move Supabase from Free to Pro (proposal: before first paying merchant)
- O5 Where merchant and delivery screens live: decided 2026-11-10, see D28
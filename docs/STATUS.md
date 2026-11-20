# STATUS

Last updated: 2026-11-10

## Done
- Research, pricing, go-to-market proposals (docs/)
- Owner confirmed: daily-supply wholesalers first (D2), three order types (D16),
  public link + QR signup (D17), PWA then Play Store wrapper (D8), Claude Code (D18)
- Owner's product scope answers (2026-11-10): customers log in by WhatsApp link,
  no OTP (D27); one app at app.<domain> for owners, staff and delivery (D28);
  finish M0 before M1 (D29); website add-on in three one-time-fee tiers (D30).
  docs/ROADMAP.md expanded to the full product, with Claude's extra ideas marked
  "(suggested)". Website add-on prices are blank in PRICING.md for the owner.
- M0 database migration written: supabase/migrations/0001_foundation.sql
- M0 step 1 of 6: Next.js app (versions in D19), Tailwind with bill-book colour
  tokens, Hindi + English labels, Supabase helpers, .env.local.example,
  .gitignore, ESLint + Prettier.
- Supabase cloud project set up by the owner. The app connects and migration 0001
  is applied. The owner reports logging in as super admin; two logins exist and
  both looked like super admin to the owner (see Blockers).
- M0 step 2 of 6: email + password login, log out, role check from
  platform_admins and memberships (src/lib/auth/viewer.ts), /account, /admin.
- M0 step 3 of 6 (built, waiting for the owner's click-through): shop list, new
  shop (admin_create_tenant), plan/status/trial-end editing, people per shop
  (migration 0002, D26), login page shows who is already logged in.
- M0 step 4 of 6 (built, waiting for the owner's check): addresses by host name
  (src/lib/hosts.ts, src/middleware.ts):
  - localhost:3000 = our website; /login and /admin there redirect to the app.
  - app.localhost:3000 = the app (login, account, super admin).
  - <shop>.localhost:3000 = that shop's storefront placeholder (shop name,
    "ordering starts soon", "Powered by" footer) through tenant_by_slug.
  - Unknown or switched-off shop: "Shop not found" page with status 404.
    Reserved names (api, store, help, a.b.x) also 404; admin.<domain> goes to
    the app's /admin; www goes to the main domain.
  - Set by NEXT_PUBLIC_ROOT_DOMAIN. Empty = one-address mode for previews;
    shops are then at /shop/<shop>.
  Tested: every host kind above with curl and the browser pane; a temporary
  real shop showed its storefront (200) and, once switched off, "Shop not
  found" (404); lint, typecheck and production build pass.
- M0 step 5 of 6: tenant isolation test, `npm test` (Vitest 5.1.0,
  tests/rls/tenant-isolation.test.ts). Creates shops A and B, each with a
  merchant-admin login, and proves with the publishable key that each sees its
  own shop and none of the other's tenants, subscriptions or memberships rows
  (each blocked row is first confirmed to exist with the secret key); that
  neither can rename or join the other shop; and that a logged-out visitor sees
  nothing. 11 of 11 passed twice on 2026-11-10 against the dev project; test
  data is deleted afterwards (checked: 0 left).
- M0 step 6 of 6 (ready; live deploy waits for the owner's Cloudflare login):
  Cloudflare adapter (@opennextjs/cloudflare 1.20.16) and wrangler 4.159.0;
  wrangler.jsonc, open-next.config.ts (no page cache), public/_headers,
  scripts/cloudflare.mjs (npm run cf:login / cf:preview / cf:deploy /
  cf:rollback), docs/DEPLOY.md (incl. adding the domain later).
  - Found: the adapter copies every .env file into the uploaded site, so the
    secret key was moved from .env.local to .env.secrets (D32) and the deploy
    script blocks secrets before and after building.
  - Built natively on Windows (the adapter warns Windows is not fully
    supported). Ran the build locally in Cloudflare's runtime: all pages,
    redirects, a real shop at /shop/<shop>, 404s and asset caching correct;
    no runtime errors; upload 1.4 MB compressed. Live site not deployed yet.

## In progress
- M0 step 6: owner logs in to Cloudflare (npm run cf:login), then deploy.

## Next
- After deploy: owner clicks through M0 (steps 3, 4 and the live site).
- Then M1 (shop-owner app, installable app, customer WhatsApp-link login, ...).

## Blockers / open questions for the owner
- Cloudflare: account, workers.dev subdomain, and `npm run cf:login` on this
  computer (docs/DEPLOY.md, "One-time setup").
- Run supabase/migrations/0002_admin_members.sql in Supabase's SQL Editor (needed
  for the People section on a shop page).
- Log in again at http://app.localhost:3000/login: logins are per address, so the
  old localhost:3000 login does not carry over.
- Both logins looked like super admin. Check with the platform_admins query,
  remove the second one if needed, then confirm a non-admin lands on "My account".
- Open http://<your-shop>.localhost:3000 for a shop you created, to see its
  storefront placeholder.
- Before step 6: a domain on Cloudflare is needed for shop subdomains, and the
  Workers Paid plan ($5/month) is likely needed (free plan: 10 ms CPU per request).
- Website add-on prices and the open points in D30 (domain renewal, what happens
  when a subscription lapses).
- The Supabase CLI is not set up yet; step 5 or 6 will need it for migrations
  and generated database types.
- The project folder name contains "&", which breaks npm's Windows shims (`npx`).
  package.json scripts work around it; renaming the folder would remove it.
- `next dev` may add a managed Next.js block to AGENTS.md when it detects a coding
  agent (set `agentRules: false` in next.config.ts to stop it).
- Pilot bakery facts not collected yet (docs/PILOT.md). Needed before M1.
- Other PROPOSED items in docs/DECISIONS.md (D19-D26) need a yes or no.

## Session log (newest first)
- 2026-11-10: M0 step 6 prepared: Cloudflare build works and was tested
  locally; secret key moved to .env.secrets; docs/DEPLOY.md written (D31, D32).
  Waiting for the owner's Cloudflare login to go live.
- 2026-11-10: M0 step 5 done: tenant isolation test passes (11/11). Real shop
  storefront and switched-off shop checked for step 4.
- 2026-11-10: Owner asked for the full product (apps, website add-on, extras).
  Decisions D27-D30, roadmap expanded. M0 step 4 built (host routing, storefront
  placeholder, shop not-found).
- 2026-11-10: M0 step 3 built (shop list, new shop, plan/status/trial edit,
  people per shop via 0002, login shows current account).
- 2026-11-10: M0 step 2 built (login, role guard, /account, /admin shell; D25, O5).
- 2026-11-10: M0 step 1 done (app scaffold, Supabase helpers, versions D19-D24).
- 2026-11-10: Owner answered scope questions. M0 migration written.
- 2026-11-10: Research and planning session.

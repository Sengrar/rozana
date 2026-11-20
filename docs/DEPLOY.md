# DEPLOY

How the app goes live on Cloudflare Workers.
Last deployed 2026-11-20 with Next.js 16.4.6, @opennextjs/cloudflare 1.20.16
and wrangler 4.159.0. No secrets in this file, ever.

## What runs where
- Cloudflare Workers runs the whole Next.js app (pages, middleware, server
  actions) through the OpenNext adapter (D7, D22). Settings: `wrangler.jsonc`,
  `open-next.config.ts`, and `"cloudflare"` in `package.json`.
- Supabase (database and login) stays where it is. Until a separate live
  project exists (before the pilot, M3), the live site uses the same Supabase
  project as development.
- No page cache: every page is rendered on request (`open-next.config.ts`).

## Live now: one address on workers.dev (no domain yet)
Live since 2026-11-20: **https://rozana.rozana.workers.dev** (Worker `rozana`
on the account's workers.dev subdomain `rozana`). Everything is on one address:
- `/` our website
- `/login`, `/account`, `/admin` the app
- `/shop/<shop>` a shop's storefront

This is because `package.json` has `"cloudflare": { "rootDomain": "" }`.
When the domain is ready, see "Adding the domain" below.

## One-time setup (owner)
1. Cloudflare account: sign up free at https://dash.cloudflare.com/sign-up,
   or use the one you have.
2. workers.dev address: the first `npm run cf:deploy` asks to register a
   workers.dev subdomain; answer Y and type a name. Done on 2026-11-20: `rozana`.
3. Log this computer in. In the project folder run `npm run cf:login`. The
   browser opens; log in and click Allow. Check with `npm run cf:whoami`.

## Deploying (every time)
1. `npm run lint`, `npm run typecheck` and `npm test` all pass.
2. `npm run cf:preview` builds the live version and runs it on
   http://localhost:8787 in Cloudflare's runtime. Click through it, then stop it
   with Ctrl+C.
3. `npm run cf:deploy` builds again and uploads. It prints the live address.
4. Open the live address and check `/`, `/login` and `/shop/<a shop>`.

To undo a bad deploy: `npm run cf:rollback` and pick the previous version
(or Cloudflare dashboard > Workers & Pages > rozana > Deployments).

### If the deploy fails
- "Unable to resolve Cloudflare's API hostname" or "fetch failed": the internet
  connection dropped. Run `npm run cf:deploy` again; files already uploaded are
  skipped.
- "Authentication error [code: 10000]" after a long upload: the Cloudflare login
  (it lasts about an hour) ran out while the upload was still going. On a slow
  connection the upload takes over two minutes. Run `npm run cf:deploy` again;
  wrangler renews the login first. This happened on 2026-11-20.
- Asked to register a workers.dev subdomain: run the deploy in a terminal where
  you can type the answer (see One-time setup).

### What `cf:deploy` does (`scripts/cloudflare.mjs`)
1. Refuses to build if `.env`, `.env.local` or any other `.env.*` file the build
   reads holds a secret. The adapter copies all values from those files into
   the uploaded site.
2. Builds with the adapter (`opennextjs-cloudflare build`). The main domain
   comes from `package.json` (`rootDomain`; empty becomes "none", meaning one
   address), not from `.env.local` (which says `localhost:3000`).
3. Checks every build file for the secret key from `.env.secrets`.
4. Runs `wrangler deploy` itself, with `OPEN_NEXT_DEPLOY=true`. The adapter's
   own deploy command starts wrangler through npm's Windows shims, which this
   folder's "&" breaks.

## Settings and secrets
| Setting | Comes from | Secret? |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local`, copied into the build | no |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `.env.local`, copied into the build | no |
| `NEXT_PUBLIC_ROOT_DOMAIN` | `package.json` `cloudflare.rootDomain`, at build time | no |
| `SUPABASE_SECRET_KEY` | `.env.secrets`, read only by `npm test` | YES |

- Nothing needs to be set in the Cloudflare dashboard today.
- Never put the secret key in `.env.local`, in Cloudflare, or in `docs/`.
  The deploy stops if it finds it.
- `NEXT_PUBLIC_` values are fixed at build time. Change them, then deploy again.

## Adding the domain (D28)
1. Buy the domain from any registrar. In Cloudflare, add it as a site (Free
   plan) and change the domain's nameservers at the registrar to the two
   Cloudflare shows. Wait until Cloudflare says the domain is Active.
2. DNS: add two records, both Proxied (orange cloud), type AAAA, content `100::`
   (the Worker answers, so there is no server behind them):
   - name `@` (the domain itself)
   - name `*` (every shop's subdomain, and `app`)
3. `wrangler.jsonc`: add, with the real domain:
   ```jsonc
   "routes": [
     { "pattern": "yourdomain.in/*", "zone_name": "yourdomain.in" },
     { "pattern": "*.yourdomain.in/*", "zone_name": "yourdomain.in" }
   ],
   ```
   Cloudflare's Custom Domains cannot be wildcards, so routes are used.
   Cloudflare's free certificate covers `yourdomain.in` and `*.yourdomain.in`
   (one level), which is all this needs.
4. `package.json`: `"cloudflare": { "rootDomain": "yourdomain.in" }`.
5. Supabase > Authentication > URL Configuration: Site URL
   `https://app.yourdomain.in`; add redirect URL `https://app.yourdomain.in/**`.
6. `npm run cf:deploy`, then check `https://yourdomain.in`,
   `https://app.yourdomain.in/login` and `https://<shop>.yourdomain.in`.
7. Optional: stop serving the workers.dev address with `"workers_dev": false`
   in `wrangler.jsonc`.

## Costs and limits
- Workers Free plan: 100,000 requests a day and 10 ms of CPU per request.
  Pages that check a login often need more than 10 ms. If the live site shows
  "Error 1102" (resource limits), move to Workers Paid ($5/month, Stage 1 in
  docs/PRICING.md).
- Upload size on 2026-11-10: 6.6 MB, 1.4 MB compressed (free plan limit 3 MB
  compressed per the OpenNext docs).

## Windows notes
- The adapter warns that it is "not fully compatible with Windows" and suggests
  WSL. The build worked natively on 2026-11-10. If a build, or the live site,
  fails in a way `npm run dev` does not, build inside WSL, or let Cloudflare
  build from GitHub (below).
- `npx` does not work in this folder (the "&" in its name). Use the npm scripts.

## Later
- Git + GitHub, then Cloudflare Workers Builds to deploy on every push to `main`.
  Build variables there: the `NEXT_PUBLIC_` values only, never the secret key.
- A separate Supabase project for live data, before the pilot.
- Image resizing through Cloudflare Images, when product photos arrive (M1).

# Rozana (working codename)

Multi-tenant SaaS for daily-supply wholesalers who also run a shop.
Product rules: `AGENTS.md`. Plans, status and decisions: `docs/`.
New to the project? Start with `CONTRIBUTING.md`.

## Run it on your computer

1. Install Node.js 22.12 or newer (24 LTS recommended; the tests need 22.12+).
2. In this folder, run `npm install`.
3. Copy `.env.local.example` to `.env.local` and fill in the Supabase values.
4. For the tests only: copy `.env.secrets.example` to `.env.secrets` and add
   the Supabase secret key. Never put that key in `.env.local`.
5. Run `npm run dev` and open http://localhost:3000 (the app is at
   http://app.localhost:3000, shops at http://<shop>.localhost:3000).

## Scripts

| Command                | What it does                                      |
| ---------------------- | ------------------------------------------------- |
| `npm run dev`          | Development server on port 3000                   |
| `npm run build`        | Production build                                  |
| `npm run lint`         | ESLint                                            |
| `npm run typecheck`    | TypeScript check                                  |
| `npm run format`       | Format code with Prettier                         |
| `npm run format:check` | Check formatting without writing                  |
| `npm test`             | Tenant isolation test (see below)                 |
| `npm run cf:preview`   | Build for Cloudflare and run it on port 8787      |
| `npm run cf:deploy`    | Build for Cloudflare and go live (docs/DEPLOY.md) |
| `npm run cf:rollback`  | Go back to the previous live version              |
| `npm run cf:login`     | Log this computer in to Cloudflare                |

`npm test` needs `SUPABASE_SECRET_KEY` in `.env.secrets`. It creates two test
shops and two test logins (names start with `rlstest-`) in the Supabase
project, checks that neither shop can read the other's rows, then deletes them.
Run it against the development project, not the live one.

## Windows note

This folder's name contains `&`. On Windows that breaks npm's command shims
(`npx <tool>` and anything in `node_modules/.bin`). The scripts above call each
tool through `node` directly, so they work anyway. Use `npm run <script>`, not
`npx <tool>`. Renaming the folder (for example to `..._and_Wholesaler`) would
remove the problem for good.

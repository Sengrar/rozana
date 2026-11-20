# Working on this project

Welcome. Read these first, in this order:

1. `AGENTS.md`: what we are building and the hard rules.
2. `docs/STATUS.md`: what is done, in progress and blocked.
3. `docs/DECISIONS.md`: what has been decided, and why.
4. `docs/ROADMAP.md`: what comes next. Work on the next unchecked item unless
   the owner says otherwise.

## Access you need (ask the owner)

- **GitHub**: an invite to this repository with write access.
- **Supabase**: an invite to the organisation that holds the development
  project (Supabase dashboard > Organization > Team). You need it to make your
  own secret key for the tests (see Setup, step 4).
- **A login for the app**: the owner creates it in Supabase (Authentication >
  Add user) and adds it to `platform_admins` if you need the super admin area.
- **Cloudflare**: not needed. Only the owner deploys for now (docs/DEPLOY.md).

## Setup

1. Install Git and Node.js 22.12 or newer (24 LTS recommended; see
   `.node-version`).
2. Get the code and install packages:
   ```bash
   git clone https://github.com/Sengrar/rozana.git
   cd rozana
   npm ci
   ```
3. Copy `.env.local.example` to `.env.local` and fill in the Supabase URL and
   publishable key (Supabase > Project Settings > API Keys). Only public values
   go in this file: the Cloudflare build copies it into the live site.
4. For `npm test` only: copy `.env.secrets.example` to `.env.secrets`. In
   Supabase > Project Settings > API Keys > Secret keys, create your own key
   named `local-tests-<your-name>` and put it there. Never share it, never
   commit it, never put it in `.env.local` (D32).
5. Run `npm run dev` and open:
   - http://localhost:3000 for our website
   - http://app.localhost:3000 for the app (login, super admin)
   - `http://<shop>.localhost:3000` for a shop's storefront

The shared development database already has every file in
`supabase/migrations/` applied. Only run them yourself on your own Supabase
project.

## Everyday workflow

- `main` is what goes live. Do not push to it directly.
- Start a branch for each piece of work:
  `git switch -c feat/short-name` (or `fix/...`, `docs/...`).
- Before you push, all of these must pass:
  ```bash
  npm run lint
  npm run typecheck
  npm run format:check
  npm test
  ```
  `npm run format` fixes formatting. `npm test` talks to the development
  database: it creates test shops and logins named `rlstest-...` and deletes
  them again.
- Push the branch and open a pull request. CI checks lint, types, formatting
  and the Cloudflare build (it cannot run `npm test`, which needs a secret
  key). The owner reviews and merges.
- Update `docs/STATUS.md` in the same pull request, and `docs/DECISIONS.md`
  when something new is decided.

## Database changes

- Add a new numbered file in `supabase/migrations/` (for example
  `0003_products.sql`). Never edit a file that has already been run.
- Every tenant table gets `tenant_id` and row-level security policies, and
  `npm test` must keep proving that one shop cannot read another's rows.
- Ask the owner before changing existing tables or policies.
- Update `src/lib/supabase/database.types.ts` to match.

## Rules that matter most (full list in AGENTS.md)

- Money is whole paise (integers). Ledger entries are never edited or deleted.
- Plan limits and features come from the `plans` table, never from code.
- Every label in Hindi and English (`<Bi>` in `src/components/bi.tsx`), large
  touch targets, and it must work on a cheap Android phone on slow data.
- Colours only from the theme tokens in `src/app/globals.css`. No gradients,
  glass effects or emoji icons.
- No secrets or keys in git, `docs/`, screenshots or chat.

## Notes

- On Windows, a folder name containing `&` breaks `npx`. The npm scripts call
  every tool through `node`, so use `npm run ...` instead of `npx ...`.
- Questions: ask the owner.

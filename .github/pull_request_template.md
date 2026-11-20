## What changed, and why

## How I checked it

- [ ] `npm run lint`, `npm run typecheck` and `npm run format:check` pass
- [ ] `npm test` passes (needed when the database or access rules change)
- [ ] Checked the screens at phone size (needed when screens change)

## Rules

- [ ] No secrets or keys in code, docs or screenshots
- [ ] Every new label in Hindi and English
- [ ] Money in whole paise; any new tenant table has `tenant_id` and RLS
- [ ] `docs/STATUS.md` updated (and `docs/DECISIONS.md` if something was decided)

# Reservation Apps - AI Context Guide

This is a monorepo for a property reservation system built with FeathersJS (API) and Qwik (Frontend).

## Project Structure

```
reservation-apps/
├── apps/
│   ├── api/              # FeathersJS REST/WebSocket API
│   └── frontend-qwik/    # Qwik + Tailwind frontend
├── packages/
│   └── tsconfig/         # Shared TypeScript configs
├── docs/
│   ├── adr/              # Architecture decision records
│   └── agents/           # Issue tracker, triage labels and domain docs for agent skills
└── .claude/skills/       # AI knowledge modules
```

## Quick Reference

- **Runtime:** Node.js 22.12 or later (Vitest 5 needs it to run the frontend unit tests)
- **Package manager:** npm workspaces (`package-lock.json`). Not pnpm or yarn
- **Monorepo:** Turborepo 2
- **API:** FeathersJS 5 + Koa + PostgreSQL + Knex 3. Tests use Mocha 12; seeds use Faker 10
- **Frontend:** Qwik 1.20 + Qwik City + Vite 6 + Tailwind CSS 3. Unit tests use Vitest 5; e2e tests use Playwright
- **Validation:** TypeBox (API) / Zod (Frontend)
- **Linting:** ESLint 8 + typescript-eslint 8
- **Secrets:** Infisical

## Skills Catalog

When working on specific areas, reference these skill files for detailed patterns and conventions:

| Skill | Description | Path |
|-------|-------------|------|
| FeathersJS Services | Service architecture, hooks, resolvers, and REST/WebSocket patterns | `.claude/skills/feathers-services.md` |
| Qwik Frontend | Components, routing, state management, and Qwik City patterns | `.claude/skills/qwik-frontend.md` |
| Turborepo Monorepo | Workspace configuration, task pipelines, and dependency management | `.claude/skills/turborepo-monorepo.md` |
| Knex Database | Migrations, seeds, query building, and PostgreSQL patterns | `.claude/skills/knex-database.md` |
| TypeBox Schemas | Schema validation, type generation, and FeathersJS integration | `.claude/skills/typebox-schemas.md` |
| S3 & Cloudinary | File uploads, presigned URLs, and image management | `.claude/skills/storage-patterns.md` |
| Testing Patterns | Unit tests (Mocha/Vitest), E2E tests (Playwright), and test utilities | `.claude/skills/testing-patterns.md` |
| Code Standards | ESLint, Prettier, commit conventions, and TypeScript standards | `.claude/skills/code-standards.md` |

## Common Tasks

Run these from the repo root. `-w api` or `-w frontend-qwik` runs a script in that workspace.

### Development
```bash
npm run dev                  # Start the API and frontend (frontend waits for the API on :3030)
npm run dev:reset -w api     # Reset the dev database if the schema changed, migrate, seed, start the API
```

### Database

The API reads its database connection from Infisical secrets. `seed` and `dev:reset` load them
themselves; `migrate` and `generate:types` need wrapping in `infisical run`:

```bash
infisical run --env=dev --path=/Apps/reservation-apps/api -- npm run migrate -w api   # Run migrations
npm run migrate:make -w api -- <migration_name>                                     # Create a new migration
npm run seed -w api                                                                 # Run seed files
```

### Testing
```bash
npm test                              # API tests: resets the test database, migrates, seeds, runs Mocha
npm run test.unit -w frontend-qwik    # Frontend unit tests (Vitest)
npm run test.e2e -w frontend-qwik     # Frontend e2e tests (Playwright)
```

The e2e tests need the API running. They use the dev server on `http://localhost:5173`, and
start it if it isn't running. Set `PUBLIC_BASE_URL` and `PORT` to test a server somewhere else.

### Lint and build
```bash
npx turbo run lint    # Lint the API and frontend
npm run build         # Build the API and frontend
npm start -w api      # Run the compiled API (after a build), as in production
```

## Path Aliases

**API (`apps/api`):**
- `@seeds/*` → `seeds/*`
- `@services/*` → `src/services/*`
- `@utils/*` → `src/utils/*`
- `@database-generated-types/*` → `src/types/*`

Aliases only work under ts-node (dev, tests and seeds). The compiled API runs with plain Node, so
code in `apps/api/src` must use relative imports for anything that runs; type-only imports can
still use aliases. An ESLint rule enforces this in `src`, and `npm run compile` checks the
compiled output.

**Frontend (`apps/frontend-qwik`):**
- `~/*` → `src/*`

## Key Conventions

1. **Commit Messages:** Conventional Commits (`type(scope): subject`)
2. **File Naming:** kebab-case for files, PascalCase for classes
3. **No Semicolons:** Prettier configured without semicolons
4. **Print Width:** 100 characters
5. **No Co-Authored-By:** Do not add Co-Authored-By lines in commit messages

## Agent skills

### Issue tracker

Issues live in GitHub Issues for this repo, managed with the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Uses the five default triage labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.

# Reservation Apps - AI Context Guide

This is a monorepo for a property reservation system built with FeathersJS (API) and Qwik (Frontend).

## Project Structure

```
reservation-apps/
├── apps/
│   ├── api/              # FeathersJS REST/WebSocket API
│   └── frontend-qwik/    # Qwik + Tailwind frontend
├── packages/
│   ├── tsconfig/         # Shared TypeScript configs
│   └── storage/          # Shared storage utilities
└── .claude/skills/       # AI knowledge modules
```

## Quick Reference

- **Runtime:** Node.js >= 20.9.0
- **Monorepo:** Turborepo
- **API:** FeathersJS v5 + Koa + PostgreSQL + Knex
- **Frontend:** Qwik v1.9 + Vite + Tailwind CSS
- **Validation:** TypeBox (API) / Zod (Frontend)
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

### Development
```bash
pnpm dev              # Start all apps (API + Frontend)
pnpm dev:reset        # Reset database and restart
```

### Database
```bash
cd apps/api
pnpm migrate          # Run migrations
pnpm migrate:make     # Create new migration
pnpm seed             # Run seed files
```

### Testing
```bash
pnpm test             # Run all tests
cd apps/frontend-qwik && pnpm test.e2e  # E2E tests
```

## Path Aliases

**API (`apps/api`):**
- `@services/*` → `src/services/*`
- `@utils/*` → `src/utils/*`
- `@database-generated-types/*` → `src/database-generated-types/*`

**Frontend (`apps/frontend-qwik`):**
- `~/*` → `src/*`

## Key Conventions

1. **Commit Messages:** Conventional Commits (`type(scope): subject`)
2. **File Naming:** kebab-case for files, PascalCase for classes
3. **No Semicolons:** Prettier configured without semicolons
4. **Print Width:** 100 characters

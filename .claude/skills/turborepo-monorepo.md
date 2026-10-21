# Turborepo Monorepo Patterns

## Overview

This project uses Turborepo for monorepo management with npm workspaces. There is one lockfile,
`package-lock.json`, at the repo root. Don't use pnpm or yarn.

## Workspace Structure

```
reservation-apps/
├── apps/
│   ├── api/              # FeathersJS backend
│   └── frontend-qwik/    # Qwik frontend
├── packages/
│   └── tsconfig/         # Shared TypeScript configs
├── turbo.json            # Turborepo configuration
└── package.json          # Root workspace config
```

## Root package.json

```json
{
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "test": "turbo run test",
    "build": "turbo run build",
    "dev": "turbo run dev --no-cache"
  },
  "packageManager": "npm@10.1.0"
}
```

There is no root `lint` script; run `npx turbo run lint` instead.

## Turborepo Configuration (turbo.json)

```json
{
  "tasks": {
    "build": {
      "outputs": ["lib/**", "dist/**", "server/**"],
      "dependsOn": ["^build"]
    },
    "test": { "cache": false },
    "lint": { "dependsOn": ["^build"], "outputs": [] },
    "dev": { "cache": false },
    "dev:reset": { "cache": false },
    "clean": { "cache": false }
  }
}
```

## Task Pipeline

| Task | Dependencies | Cache | Description |
|------|--------------|-------|-------------|
| `build` | `^build` | Yes | Build in dependency order. The API builds first, because the frontend imports its client |
| `test` | None | No | Runs each workspace's `test` script. Only the API has one; it starts and resets the test database itself |
| `lint` | `^build` | Yes | Lint the API and frontend |
| `dev` | None | No | Development mode |

## Running Commands

```bash
# Run in all workspaces
npm run dev                  # Start all apps
npm run build                # Build all apps
npx turbo run lint           # Lint all packages

# Run in one workspace (-w is short for --workspace)
npm run dev -w api           # Dev API only
npm run dev -w frontend-qwik # Dev frontend only (waits for the API on :3030)

# Run in several workspaces
npx turbo run build --filter="./apps/*"
```

## Adding Dependencies

```bash
# Add to a specific workspace
npm install lodash -w api
npm install -D vitest -w frontend-qwik

# Add to the root (shared dev tools). In npm, -w means "workspace", so leave it off here
npm install -D typescript
```

To depend on another workspace, add it by name with the version `"*"` and run `npm install`;
npm links the local package instead of downloading it. npm doesn't support pnpm's
`workspace:*` protocol.

## Shared Packages

### packages/tsconfig

Shared TypeScript configurations:

```
packages/tsconfig/
├── base.json          # Base config (ES2022, Node resolution)
└── package.json
```

Usage in apps:
```json
{
  "extends": "tsconfig/base.json"
}
```

## Inter-Package Dependencies

The frontend depends on the API package for typed client:

```json
// apps/frontend-qwik/package.json
{
  "dependencies": {
    "api": "*"
  }
}
```

The API's `main` and `types` point at its compiled client (`lib/src/client.js` and `.d.ts`), so
the API must be compiled before the frontend can type-check against it. `npm run build` does
this in the right order.

This enables importing the typed Feathers client:
```typescript
import { createClient } from 'api'
```

## Cache Configuration

- `outputs` define what gets cached (e.g., `dist/**`, `lib/**`)
- `cache: false` disables caching for tasks like `dev` and `test`
- `persistent: true` for long-running tasks like dev servers

## Environment Variables

Turborepo passes through environment variables. Use `globalEnv` in turbo.json for variables that affect caching:

```json
{
  "globalEnv": ["NODE_ENV", "DATABASE_URL"]
}
```

## Best Practices

1. **Topological Builds**: Use `^build` for dependencies to build in correct order
2. **Parallel Execution**: Turborepo automatically parallelizes independent tasks
3. **Caching**: Leverage remote caching for CI/CD with `turbo login` and `turbo link`
4. **Filtering**: Use `--filter` to run tasks in specific packages
5. **Persistent Tasks**: Mark long-running tasks with `persistent: true`

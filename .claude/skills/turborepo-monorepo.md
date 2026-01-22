# Turborepo Monorepo Patterns

## Overview

This project uses Turborepo for monorepo management with pnpm workspaces.

## Workspace Structure

```
reservation-apps/
├── apps/
│   ├── api/              # FeathersJS backend
│   └── frontend-qwik/    # Qwik frontend
├── packages/
│   ├── tsconfig/         # Shared TypeScript configs
│   └── storage/          # Shared storage utilities
├── turbo.json            # Turborepo configuration
└── package.json          # Root workspace config
```

## Root package.json

```json
{
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "test": "turbo test",
    "lint": "turbo lint",
    "clean": "turbo clean"
  }
}
```

## Turborepo Configuration (turbo.json)

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["lib/**", "dist/**", "server/**"]
    },
    "test": {
      "dependsOn": ["docker:test", "dev:api"],
      "cache": false
    },
    "lint": {},
    "dev": {
      "cache": false,
      "persistent": true
    },
    "dev:reset": {},
    "clean": {
      "cache": false
    }
  }
}
```

## Task Pipeline

| Task | Dependencies | Cache | Description |
|------|--------------|-------|-------------|
| `build` | `^build` | Yes | Build with topological dependency order |
| `test` | `docker:test`, `dev:api` | No | Run tests (needs DB + API) |
| `lint` | None | Yes | Lint all packages |
| `dev` | None | No | Development mode (persistent) |
| `clean` | None | No | Clean build artifacts |

## Running Commands

```bash
# Run in all workspaces
pnpm dev              # Start all apps
pnpm build            # Build all apps
pnpm lint             # Lint all packages

# Run in specific workspace
pnpm --filter api dev          # Dev API only
pnpm --filter frontend-qwik dev # Dev frontend only

# Run in multiple workspaces
pnpm --filter "apps/*" build   # Build all apps
```

## Adding Dependencies

```bash
# Add to specific workspace
pnpm --filter api add lodash
pnpm --filter frontend-qwik add -D vitest

# Add to root (dev tools)
pnpm add -D -w typescript

# Add workspace dependency
pnpm --filter frontend-qwik add api@workspace:*
```

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

### packages/storage

Shared storage utilities for S3/Cloudinary operations.

## Inter-Package Dependencies

The frontend depends on the API package for typed client:

```json
// apps/frontend-qwik/package.json
{
  "dependencies": {
    "api": "workspace:*"
  }
}
```

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

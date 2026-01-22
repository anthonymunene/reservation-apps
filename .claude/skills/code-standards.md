# Code Standards

## Overview

This project enforces consistent code style through ESLint, Prettier, and Conventional Commits.

## Prettier Configuration

File: `.prettierrc`

```json
{
  "trailingComma": "es5",
  "printWidth": 100,
  "semi": false,
  "tabWidth": 2,
  "arrowParens": "avoid",
  "parser": "typescript"
}
```

### Key Rules

| Rule | Value | Example |
|------|-------|---------|
| Semicolons | None | `const x = 1` |
| Print width | 100 chars | Wrap at 100 |
| Trailing commas | ES5 | `{ a, b, }` |
| Arrow parens | Avoid | `x => x + 1` |
| Tab width | 2 spaces | Standard indent |

## ESLint Configuration

File: `.eslintrc.json`

```json
{
  "root": true,
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "plugins": ["@typescript-eslint"],
  "rules": {
    "prettier/prettier": "error"
  }
}
```

### Running Linter

```bash
pnpm lint           # Lint all packages
pnpm --filter api lint     # Lint API only
```

## TypeScript Standards

### Strict Mode

Frontend uses strict TypeScript:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

### Path Aliases

**API** (`apps/api/tsconfig.json`):
```json
{
  "paths": {
    "@services/*": ["src/services/*"],
    "@utils/*": ["src/utils/*"],
    "@database-generated-types/*": ["src/database-generated-types/*"]
  }
}
```

**Frontend** (`apps/frontend-qwik/tsconfig.json`):
```json
{
  "paths": {
    "~/*": ["./src/*"]
  }
}
```

### Type Imports

Prefer type imports when importing only types:

```typescript
// Good
import type { Application } from "../../declarations"
import type { Static } from "@feathersjs/typebox"

// Also acceptable
import { type Application, app } from "../../declarations"
```

## Naming Conventions

### Files

| Type | Convention | Example |
|------|------------|---------|
| Services | kebab-case | `user-profiles.ts` |
| Components | PascalCase | `PropertyCard.tsx` |
| Hooks | camelCase | `useGetProperties.ts` |
| Utils | kebab-case | `image-utils.ts` |
| Tests | `.test.ts` / `.spec.tsx` | `users.test.ts` |

### Code

| Type | Convention | Example |
|------|------------|---------|
| Classes | PascalCase | `PropertiesService` |
| Functions | camelCase | `getProperties` |
| Constants | UPPER_SNAKE | `MAX_UPLOAD_SIZE` |
| Types/Interfaces | PascalCase | `PropertyData` |
| Variables | camelCase | `propertyList` |

## Commit Messages

Uses Conventional Commits via commitlint.

File: `commitlint.config.js`

```javascript
module.exports = {
  extends: ["@commitlint/config-conventional"],
}
```

### Format

```
type(scope): subject

body (optional)

footer (optional)
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation |
| `style` | Formatting (no code change) |
| `refactor` | Code restructuring |
| `perf` | Performance improvement |
| `test` | Adding tests |
| `chore` | Maintenance tasks |

### Scopes

Common scopes for this project:
- `api` - Backend changes
- `frontend` - Frontend changes
- `db` - Database/migrations
- `config` - Configuration changes

### Examples

```bash
# Feature
feat(api): add property search endpoint

# Bug fix
fix(frontend): resolve image loading on slow connections

# Database
feat(db): add reviews table migration

# Multiple scopes
fix(api,frontend): sync property type definitions
```

## Import Order

Organize imports in this order:

```typescript
// 1. Node built-ins
import { randomUUID } from "crypto"

// 2. External packages
import { Type } from "@feathersjs/typebox"
import { component$ } from "@builder.io/qwik"

// 3. Internal aliases
import { PropertiesService } from "@services/properties"
import { api } from "~/client"

// 4. Relative imports
import { helper } from "./utils"
import type { MyType } from "../types"
```

## Code Formatting Commands

```bash
# Format all files
pnpm --filter frontend-qwik fmt

# Check formatting
pnpm lint

# Fix auto-fixable issues
pnpm lint --fix
```

## Editor Setup

### VS Code Settings

Recommended `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### Recommended Extensions

- ESLint
- Prettier
- TypeScript Importer
- Tailwind CSS IntelliSense

## Documentation

- Use JSDoc for public APIs when intent isn't obvious
- Prefer self-documenting code over comments
- Keep README files updated in each package

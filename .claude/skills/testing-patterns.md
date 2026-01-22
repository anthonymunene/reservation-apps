# Testing Patterns

## Overview

This project uses different testing frameworks for API and frontend:
- **API**: Mocha for unit/integration tests
- **Frontend**: Vitest for unit tests, Playwright for E2E

## Test Structure

```
apps/
├── api/
│   └── test/
│       └── services/
│           └── *.test.ts     # Service tests
└── frontend-qwik/
    ├── src/**/*.spec.tsx     # Unit tests (co-located)
    └── e2e/
        └── *.spec.ts         # Playwright E2E tests
```

## API Testing (Mocha)

### Running Tests

```bash
cd apps/api
pnpm test           # Runs docker:test then mocha
```

The test pipeline requires Docker for a test database.

### Service Test Pattern

```typescript
// test/services/users.test.ts
import assert from "assert"
import { app } from "../../src/app"

describe("users service", () => {
  it("registered the service", () => {
    const service = app.service("users")
    assert.ok(service, "Registered the service")
  })

  it("creates a user", async () => {
    const user = await app.service("users").create({
      email: "test@example.com",
      password: "password123",
    })

    assert.ok(user.id)
    assert.strictEqual(user.email, "test@example.com")
  })

  it("finds users", async () => {
    const result = await app.service("users").find({
      query: { email: "test@example.com" },
    })

    assert.ok(result.data.length > 0)
  })
})
```

### Testing Hooks

```typescript
describe("sanitiseImageData hook", () => {
  it("sanitises image data on find", async () => {
    const properties = await app.service("properties").find({})

    properties.data.forEach(property => {
      property.images.forEach(image => {
        // Should only have url, no metadata
        assert.ok(image.url)
        assert.strictEqual(image.metadata, undefined)
      })
    })
  })
})
```

### Test Database Setup

The API uses a separate test database via Docker:

```bash
pnpm docker:test    # Starts test PostgreSQL
pnpm migrate        # Run migrations on test DB
```

## Frontend Unit Testing (Vitest)

### Configuration

```typescript
// vite.config.ts
export default defineConfig({
  test: {
    include: ["src/**/*.spec.tsx"],
    environment: "jsdom",
  },
})
```

### Running Tests

```bash
cd apps/frontend-qwik
pnpm test.unit      # Run Vitest
```

### Component Test Pattern

```typescript
// src/components/MyComponent.spec.tsx
import { describe, it, expect } from "vitest"
import { createDOM } from "@builder.io/qwik/testing"
import { MyComponent } from "./MyComponent"

describe("MyComponent", () => {
  it("renders correctly", async () => {
    const { screen, render } = await createDOM()

    await render(<MyComponent title="Test" />)

    expect(screen.querySelector("h1")?.textContent).toBe("Test")
  })
})
```

### Testing with Signals

```typescript
import { useSignal } from "@builder.io/qwik"

describe("Counter", () => {
  it("increments count", async () => {
    const { screen, render, userEvent } = await createDOM()

    await render(<Counter />)

    const button = screen.querySelector("button")
    await userEvent(button, "click")

    expect(screen.querySelector(".count")?.textContent).toBe("1")
  })
})
```

## E2E Testing (Playwright)

### Configuration

```typescript
// playwright.config.ts
import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "./e2e",
  webServer: {
    command: "pnpm dev",
    port: 5173,
    reuseExistingServer: !process.env.CI,
  },
})
```

### Running E2E Tests

```bash
cd apps/frontend-qwik
pnpm test.e2e       # Run Playwright tests
```

### E2E Test Pattern

```typescript
// e2e/properties.spec.ts
import { test, expect } from "@playwright/test"

test.describe("Properties", () => {
  test("displays property list", async ({ page }) => {
    await page.goto("/properties")

    // Wait for data to load
    await expect(page.locator("ul li")).toHaveCount.greaterThan(0)

    // Check property card content
    const firstProperty = page.locator("li").first()
    await expect(firstProperty.locator("img")).toBeVisible()
    await expect(firstProperty.locator("p")).toContainText(/\w+/)
  })

  test("navigates to property detail", async ({ page }) => {
    await page.goto("/properties")

    // Click first property
    await page.locator("li a").first().click()

    // Should navigate to detail page
    await expect(page).toHaveURL(/\/properties\/[a-f0-9-]+/)
  })
})
```

### Testing Forms

```typescript
test("submits login form", async ({ page }) => {
  await page.goto("/login")

  await page.fill('input[name="email"]', "test@example.com")
  await page.fill('input[name="password"]', "password123")
  await page.click('button[type="submit"]')

  // Should redirect after login
  await expect(page).toHaveURL("/dashboard")
})
```

## Test Scripts Summary

| Location | Command | Framework | Purpose |
|----------|---------|-----------|---------|
| Root | `pnpm test` | Turborepo | Run all tests |
| API | `pnpm test` | Mocha | API service tests |
| Frontend | `pnpm test.unit` | Vitest | Component unit tests |
| Frontend | `pnpm test.e2e` | Playwright | End-to-end tests |

## Best Practices

1. **Isolate Test Data**: Use unique identifiers to avoid test interference
2. **Clean Up**: Delete test data after tests complete
3. **Mock External Services**: Mock S3/Cloudinary in tests
4. **Test Database**: Use separate Docker database for API tests
5. **Co-locate Tests**: Keep unit tests next to source files
6. **E2E for Flows**: Use Playwright for critical user journeys

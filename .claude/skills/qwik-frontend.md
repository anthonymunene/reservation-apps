# Qwik Frontend Patterns

## Overview

The frontend uses Qwik v1.9 with Qwik City for routing, Tailwind CSS for styling, and connects to the FeathersJS API via the REST client.

## Project Structure

```
apps/frontend-qwik/src/
├── routes/              # File-based routing (Qwik City)
│   ├── properties/      # /properties routes
│   │   ├── (all)/       # Route group (doesn't add URL segment)
│   │   │   └── index.tsx
│   │   └── [id]/        # Dynamic segment /properties/:id
│   │       └── index.tsx
│   ├── users/           # /users routes
│   ├── login/           # /login route
│   └── layout.tsx       # Root layout
├── components/          # Reusable components
├── utils/               # Utilities
└── client.tsx           # API client setup
```

## API Client Setup

```typescript
// src/client.tsx
import rest from '@feathersjs/rest-client'
import { createClient } from 'api'

const apiURL = 'http://localhost:3030'
const fetchConnection = typeof window !== 'undefined' ? window.fetch.bind(window) : fetch
const restClient = rest(apiURL)
export const api = createClient(restClient.fetch(fetchConnection))
```

## Route Loader Pattern

Use `routeLoader$` for server-side data fetching:

```typescript
import { component$ } from "@builder.io/qwik"
import { routeLoader$ } from "@builder.io/qwik-city"
import { api } from "~/client"

export const useGetData = routeLoader$(async () => {
  const { data } = await api.service("myservice").find()
  return data
})

export default component$(() => {
  const data = useGetData()
  return (
    <div>
      {data.value.map((item, key) => (
        <div key={key}>{item.name}</div>
      ))}
    </div>
  )
})
```

## Component Pattern

```typescript
import { component$ } from "@builder.io/qwik"

export const MyComponent = component$((props: { title: string }) => {
  return (
    <div class="px-4">
      <h1>{props.title}</h1>
    </div>
  )
})
```

## File-Based Routing

| File Path | URL |
|-----------|-----|
| `routes/index.tsx` | `/` |
| `routes/properties/(all)/index.tsx` | `/properties` |
| `routes/properties/[id]/index.tsx` | `/properties/:id` |
| `routes/users/(all)/index.tsx` | `/users` |

### Route Groups
- `(all)` - Groups routes without adding a URL segment
- Useful for applying shared layouts

### Dynamic Segments
- `[id]` - Captures URL parameter
- Access via `useLocation().params.id`

## Tailwind CSS Classes

Common patterns used in this project:

```html
<!-- Grid layouts -->
<ul class="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">

<!-- Responsive padding -->
<div class="px-4 sm:px-6 lg:px-8">

<!-- Text truncation -->
<p class="truncate text-sm font-medium text-gray-900">
```

## Image Handling

Images are served from a CDN with the base URL from environment:

```typescript
<img
  src={`${import.meta.env.PUBLIC_IMAGE_BASE_URL}/properties/${property.images[0].url}`}
  alt=""
  className="object-cover"
/>
```

## Environment Variables

Access public env vars with `import.meta.env.PUBLIC_*`:

```typescript
const imageUrl = import.meta.env.PUBLIC_IMAGE_BASE_URL
```

## Path Alias

Use `~/*` to import from `src/`:

```typescript
import { api } from "~/client"
import { MyComponent } from "~/components/MyComponent"
```

## Form Handling

This project uses Modular Forms for Qwik with Zod validation:

```typescript
import { useForm, zodForm$ } from "@modular-forms/qwik"
import { z } from "zod"

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export default component$(() => {
  const [form, { Form, Field }] = useForm({
    loader: useFormLoader(),
    validate: zodForm$(schema),
  })
  // ...
})
```

## Scripts

```bash
pnpm dev          # Start dev server (waits for API on :3030)
pnpm build        # Production build
pnpm test.unit    # Vitest unit tests
pnpm test.e2e     # Playwright E2E tests
pnpm lint         # ESLint
pnpm fmt          # Prettier format
```

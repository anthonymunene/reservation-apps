# 0001: Accept build-time audit findings that have no compatible fix

- **Status:** Accepted
- **Date:** 2026-10-20
- **Related:** #37, #41

## Context

In October 2026 we worked through every critical and high finding from `npm audit` (#37 to #41). After those upgrades, the audit reports no critical findings. Nine high findings remain. They all come from two dependency chains, and neither chain can be fixed without a major migration or a version the parent package doesn't support.

**Chain 1: `braces`, through Tailwind CSS 3 and nodemon.**
`braces` has a denial-of-service advisory (GHSA-vfj7-8cjw-p6xm) that npm reports against every published version. It reaches us through `micromatch`, `fast-glob` and `chokidar`, which are used by `tailwindcss` 3 in the frontend and by `nodemon` in the API. Those parent packages are what the audit lists as flagged. npm's suggested fixes are a migration to Tailwind CSS 4, which rewrites how the CSS is configured, and downgrading nodemon to 1.x, which is years out of date.

**Chain 2: `sharp`, through Qwik City.**
`sharp` 0.34 bundles versions of libvips, libheif and librsvg with known vulnerabilities (GHSA-f88m-g3jw-g9cj, GHSA-rgj7-g3m4-5g8c, GHSA-wq5f-xc86-pv6w). The fixed release is `sharp` 0.35.5. We get `sharp` through `vite-imagetools` 9, which Qwik City 1.20.2 requires, and `vite-imagetools` 9 only accepts `sharp` 0.34. `vite-imagetools` moves to `sharp` 0.35 in version 10, but Qwik City doesn't support that version yet. npm's only suggestion is downgrading Qwik City to 1.16.1, which would bring back the critical Qwik vulnerabilities fixed in #38.

## Decision

We accept both chains as they are and don't change the dependencies.

Neither chain runs in production, and neither processes input from users:

- Tailwind CSS only runs while building the frontend's CSS, and nodemon only runs to restart the API during local development. The vulnerable `braces` code expands file patterns from our own config files, not from requests.
- `vite-imagetools` only runs when the frontend imports an image with a `vite-imagetools` query string. Nothing in the frontend does that today, so `sharp` never processes an image, either during the build or at runtime.

We also chose not to force `sharp` 0.35.5 with an npm override. That version is outside the range `vite-imagetools` 9 supports, so the override would rely on an untested combination, and it would protect against nothing while `sharp` isn't used.

## Consequences

- `npm audit` will keep reporting these nine high findings: `braces`, `micromatch`, `fast-glob`, `chokidar`, `tailwindcss`, `nodemon`, `sharp`, `vite-imagetools` and `@builder.io/qwik-city`. Future audits should compare against this list instead of treating them as new.
- `@builder.io/qwik-city` shows as flagged only because of `vite-imagetools`. Its own advisories are fixed in 1.20.2.

## When to revisit

Revisit this decision when any of the following happens:

- A Qwik City release supports `vite-imagetools` 10 or later. Upgrade Qwik City, and `sharp` will move to a patched version.
- The frontend starts importing images through `vite-imagetools` (for example, `?w=`, `?format=` or `?jsx` imports). `sharp` would then process real files, so this chain should be fixed first, with an override if no supported upgrade exists by then.
- We plan a move to Tailwind CSS 4 for other reasons. Do it together with removing this chain.
- A `braces` release fixes the advisory, or the advisory's affected range is narrowed.
- An advisory in either chain is rated critical, or is shown to be reachable through a running server.

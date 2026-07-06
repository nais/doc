---
title: React + Vite quickstart with @nais/apm
description: >-
  Instrument a React single-page app built with Vite using @nais/apm — init at
  the entry point, an error boundary, and React Router route tracking.
tags: [how-to, observability, frontend, apm, react, vite]
conditional: [tenant, nav]
---

# React + Vite quickstart with `@nais/apm`

Instrument a React single-page app (SPA) built with [Vite](https://vitejs.dev)
using [`@nais/apm`](../../apm/tutorials/track-frontend-errors.md), the Nais browser
telemetry SDK, and see your errors as issues in
[Nais APM](../../apm/README.md). This is the fast path for a client-rendered
React app: init at the entry point, a React error boundary, and route tracking for
React Router.

!!! note "Status: pre-release"
    `@nais/apm` is pre-1.0. Pin an exact version and read the
    [CHANGELOG](https://github.com/nais/apm/blob/main/CHANGELOG.md) before
    upgrading. This guide targets `0.2.0`.

!!! tip "Migrating off Sentry?"
    If your app calls `Sentry.init` today, follow
    [Migrate from Sentry to `@nais/apm`](migrate-from-sentry.md) instead — it maps
    every `@sentry/react` call site to its `@nais/apm` equivalent and lists what's
    different. On Next.js instead? See the
    [Next.js quickstart](quickstart-nextjs.md).

## Prerequisites

- A React SPA built with Vite, deployed on Nais.
- The `@nais` package registry configured in your `.npmrc`. This is a one-time
  setup — follow
  [step 1 of Track frontend errors](../../apm/tutorials/track-frontend-errors.md#1-configure-the-package-registry).

## Install

```sh
pnpm add @nais/apm@0.2.0
# or: npm install @nais/apm@0.2.0 / yarn add @nais/apm@0.2.0
```

The React helpers used below — `ApmErrorBoundary`, `enableApmReactRouterV6`,
`ApmRoutes` — live in the `@nais/apm/react` entry point.

## 1. Initialize at the entry point

Call `init()` once, as early as possible, in your app's entry module — before you
render. On Nais, everything resolves automatically except the team, which you pass
as `namespace`:

```tsx
// src/main.tsx
import { init } from '@nais/apm';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

init({
  namespace: 'my-team', // your Nais team — see the note below
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

`init()` is idempotent, so React Strict Mode's double render won't re-initialize.
App name, version, environment, and the collector URL
[resolve automatically](../../apm/reference/apm-client-api.md#configuration-resolution)
from Nais meta tags or `NAIS_*` build env. On `localhost`, where no collector
resolves, it sends **nothing** and echoes every signal to the console.

!!! info "`namespace` is your team"
    `namespace` is the Nais team that owns the app (its Kubernetes namespace).
    Nais APM attributes all telemetry by team, so it's effectively required. Pass
    it explicitly as shown, or let it resolve from a
    `<meta name="nais-team" content="my-team">` tag or the `NAIS_TEAM` env — then
    you can drop the option entirely.

!!! tip "Inlining `NAIS_*` env with Vite"
    The env-var resolution path only works if Vite inlines the values at build
    time. Expose them through Vite's
    [`define`](https://vitejs.dev/config/shared-options.html#define), e.g.
    `define: { 'process.env.NAIS_TEAM': JSON.stringify(process.env.NAIS_TEAM) }`.
    Passing `namespace` explicitly (or via a meta tag) avoids needing this.

## 2. Add an error boundary

Wrap your app in `ApmErrorBoundary`. It reports each caught render error exactly
once through `captureException` — picking up the SDK's fingerprint and context —
and renders a fallback:

```tsx
// src/App.tsx
import { ApmErrorBoundary } from '@nais/apm/react';

export default function App() {
  return (
    <ApmErrorBoundary fallback={<p>Noe gikk galt.</p>}>
      <Routes /> {/* your app */}
    </ApmErrorBoundary>
  );
}
```

The `fallback` can also be a render prop `(error, resetError) => node`, and
`withApmErrorBoundary(Component, props?)` gives you the HOC form.

## 3. Track route changes (React Router)

For client-side navigation, report route changes so pageviews and errors carry the
right URL. `@nais/apm` re-exports faro-react's route tracking as `ApmRoutes`. Call
`enableApmReactRouterV6` once after `init()`, passing your own `react-router-dom`
exports (the SDK never imports react-router itself, which keeps its version out of
its dependency tree), then render `<ApmRoutes>` where you'd render `<Routes>`:

```tsx
// src/main.tsx — after init()
import {
  createRoutesFromChildren,
  matchRoutes,
  Routes,
  useLocation,
  useNavigationType,
} from 'react-router-dom';
import { enableApmReactRouterV6 } from '@nais/apm/react';

enableApmReactRouterV6({
  createRoutesFromChildren,
  matchRoutes,
  Routes,
  useLocation,
  useNavigationType,
});
```

```tsx
// wherever you render your routes
import { Route } from 'react-router-dom';
import { ApmRoutes } from '@nais/apm/react';

<ApmRoutes>
  <Route path="/" element={<Home />} />
  <Route path="/orders/:id" element={<Order />} />
</ApmRoutes>
```

!!! warning "React Router v6 only"
    Route tracking currently wires up **React Router v6**. Many navikt apps are on
    **v7** — the wiring shown here targets v6's API, so on v7 confirm these exports
    still resolve, or track it against the
    [`@nais/apm` CHANGELOG](https://github.com/nais/apm/blob/main/CHANGELOG.md). v5
    and the data-router variants are not wired yet. The error boundary and manual
    captures work regardless of router version.

## 4. Enable tracing (optional)

To connect browser spans to your backend traces in Tempo, turn on tracing.
`@grafana/faro-web-tracing` is lazily loaded, so it stays out of your bundle unless
you enable it:

```ts
init({
  namespace: 'my-team',
  tracing: true,
});
```

Trace headers are propagated to your own origin and `*.nav.no` backends by default
(a non-overridable security floor). Add more origins with
`tracing: { propagateExtraOrigins: ['https://api.partner.example'] }`. Your backend
still has to allow the `traceparent` CORS header and export spans to Tempo — see
[frontend-to-backend trace propagation](trace-propagation.md).

## Ship readable stack traces

Production stack traces point at minified JavaScript. The Nais telemetry collector
maps them back to your source **server-side** by fetching your `.map` files from
the CDN — no upload step, no auth token. You only need to emit sourcemaps and ship
them alongside your bundle. For Vite:

```js
// vite.config.js
export default {
  build: {
    sourcemap: true, // emits .map files
  },
};
```

A Vite SPA served from `cdn.nav.no` is the ideal case for deobfuscation — the
`.map` files sit right next to the bundle. Follow
[Sourcemap deobfuscation](sourcemaps.md) for the CDN requirement.

## Don't send personal data

Nais telemetry lands in a **shared Loki instance every team can read**, so
identities must never reach it. Two rules:

- `setUser` takes an **opaque, non-identifying** id only — a salted hash, never a
  raw NAV ident, fødselsnummer, or email. Values that look like PII are dropped in
  code, and the `email` field is dropped unconditionally.

  ```ts
  import { setUser } from '@nais/apm';
  setUser({ id: hash(fnr) }); // an ident/email/fnr passed here is silently dropped
  ```

- A mandatory PII scrubber runs over every outgoing signal (fnr → `[fnr]`,
  email → `[email]`, token URL params → `[redacted]`). It's a safety net, not a
  GDPR guarantee — don't put personal data in error messages in the first place.

## See your errors as issues

Deploy, then trigger an error. Open your service in
[Nais APM](<<tenant_url("grafana", "a/nais-apm-app/services")>>) and go to the
**Issues** tab. Your exception shows up as an issue, grouped with other
occurrences, with its (deobfuscated) stack trace and impact. Filter the source to
**Browser** to isolate frontend issues.

From there you can [triage it](../../apm/how-to/triage-an-issue.md) or
[create an alert](../../apm/how-to/create-alerts.md).

## Related

- [Track frontend errors with `@nais/apm`](../../apm/tutorials/track-frontend-errors.md) — the framework-agnostic tutorial and registry setup.
- [Next.js quickstart](quickstart-nextjs.md) — for Next.js apps.
- [Migrate from Sentry to `@nais/apm`](migrate-from-sentry.md) — call-site-by-call-site.
- [`@nais/apm` API reference](../../apm/reference/apm-client-api.md) — every export and option.
- [Sourcemap deobfuscation](sourcemaps.md) · [Trace propagation](trace-propagation.md)

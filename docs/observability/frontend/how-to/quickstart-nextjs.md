---
title: Next.js quickstart with @nais/apm
description: >-
  Instrument a Next.js app with @nais/apm — client init, an error boundary,
  route tracking, and opt-in tracing. Covers both the App Router and the Pages
  Router.
tags: [how-to, observability, frontend, apm, next.js]
conditional: [tenant, nav]
---

# Next.js quickstart with `@nais/apm`

Instrument a Next.js frontend with [`@nais/apm`](../../apm/tutorials/track-frontend-errors.md),
the Nais browser telemetry SDK, and see your errors as issues in
[Nais APM](../../apm/README.md). Next.js is the most common frontend framework on
Nais, so this is the fast path: client init, a React error boundary, route
tracking, and — if you want it — distributed tracing.

This guide covers both routers:

- **[App Router](#app-router)** (`app/`) — the default since Next.js 13 and what
  most Next apps here use. Start here.
- **[Pages Router](#pages-router)** (`pages/`) — the `_app.tsx` variant, including
  the Nais golden-path template. See the [Pages Router section](#pages-router) for
  the differences.

!!! note "Status: pre-release"
    `@nais/apm` is pre-1.0. Pin an exact version and read the
    [CHANGELOG](https://github.com/nais/apm/blob/main/CHANGELOG.md) before
    upgrading. This guide targets `0.2.0`.

!!! tip "Migrating off Sentry?"
    If your app calls `Sentry.init` today, follow
    [Migrate from Sentry to `@nais/apm`](migrate-from-sentry.md) instead — it maps
    every `@sentry/nextjs` call site to its `@nais/apm` equivalent and lists what's
    different.

## Prerequisites

- A Next.js application (15 or newer for `instrumentation-client.ts`; the Pages
  Router pattern works on older versions too) deployed on Nais.
- The `@nais` package registry configured in your `.npmrc`. This is a one-time
  setup — follow
  [step 1 of Track frontend errors](../../apm/tutorials/track-frontend-errors.md#1-configure-the-package-registry).

## Install

```sh
pnpm add @nais/apm@0.2.0
# or: npm install @nais/apm@0.2.0 / yarn add @nais/apm@0.2.0
```

The React helpers used below — `initNaisAPMClient`, `ApmErrorBoundary`,
`useApmRouteTracking` — live in the `@nais/apm/react` entry point.

## App Router

### 1. Initialize the client

On Next.js 15+, the client instrumentation hook `instrumentation-client.ts` runs
once, early, in the browser — the ideal place to initialize telemetry. Create it
at your project root (next to `next.config.js`):

```ts
// instrumentation-client.ts
import { initNaisAPMClient } from '@nais/apm/react';

initNaisAPMClient({
  namespace: 'my-team', // your Nais team — see the note below
});
```

`initNaisAPMClient` no-ops on the server (`typeof window === 'undefined'`) and is
idempotent, so it's safe under React Strict Mode's double-invoke and any repeated
imports. Everything else — app name, version, environment, and the collector URL
— [resolves automatically](../../apm/reference/apm-client-api.md#configuration-resolution)
from Nais meta tags or `NAIS_*` build env. On `localhost`, where no collector
resolves, it sends **nothing** and echoes every signal to the console.

!!! info "`namespace` is your team"
    `namespace` is the Nais team that owns the app (its Kubernetes namespace).
    Nais APM attributes all telemetry by team, so it's effectively required. Pass
    it explicitly as shown, or let it resolve from a
    `<meta name="nais-team" content="my-team">` tag or the `NAIS_TEAM` env — then
    you can drop the option entirely.

### 2. Add an error boundary

Wrap your app in `ApmErrorBoundary` in the root layout. It reports each caught
render error exactly once through `captureException` — so it picks up the SDK's
fingerprint and context — and renders a fallback:

```tsx
// app/layout.tsx
import { ApmErrorBoundary } from '@nais/apm/react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nb">
      <body>
        <ApmErrorBoundary fallback={<p>Noe gikk galt.</p>}>
          {children}
        </ApmErrorBoundary>
      </body>
    </html>
  );
}
```

`ApmErrorBoundary` is a client component, but it accepts your Server Component
`children` as-is — no `'use client'` needed in the layout. The `fallback` can also
be a render prop `(error, resetError) => node`, and
`withApmErrorBoundary(Component, props?)` gives you the HOC form.

Next.js also has its own route-segment error boundaries (`error.tsx`,
`global-error.tsx`). These are separate from `ApmErrorBoundary` — to report errors
they catch, call `captureException` from them:

```tsx
// app/global-error.tsx
'use client';

import { captureException } from '@nais/apm';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureException(error);
  }, [error]);

  return (
    <html lang="nb">
      <body>
        <h2>Noe gikk galt.</h2>
        <button onClick={reset}>Prøv igjen</button>
      </body>
    </html>
  );
}
```

### 3. Track route changes

The App Router does client-side navigation without full page loads, so
pathname changes need to be reported explicitly. There's no faro-react App Router
integration; `@nais/apm` ships a small hook, `useApmRouteTracking`, that you feed
Next's navigation values. Put it in a client component and mount it once in the
layout:

```tsx
// app/ApmRouteTracker.tsx
'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useApmRouteTracking } from '@nais/apm/react';

export function ApmRouteTracker() {
  useApmRouteTracking(usePathname(), useSearchParams());
  return null;
}
```

```tsx
// app/layout.tsx (add to the body)
import { Suspense } from 'react';
import { ApmRouteTracker } from './ApmRouteTracker';

// ...inside <body>, alongside {children}:
<Suspense fallback={null}>
  <ApmRouteTracker />
</Suspense>
```

!!! warning "Wrap the tracker in `<Suspense>`"
    `useSearchParams()` opts a component into client-side rendering. Wrapping the
    tracker in a `<Suspense>` boundary keeps that opt-in from bubbling up and
    forcing the rest of the page to render client-side during static generation.

### 4. Enable tracing (optional)

To connect browser spans to your backend traces in Tempo, turn on tracing in the
init call. `@grafana/faro-web-tracing` is lazily loaded, so it stays out of your
bundle unless you enable it:

```ts
// instrumentation-client.ts
initNaisAPMClient({
  namespace: 'my-team',
  tracing: true,
});
```

Trace headers are propagated to your own origin and `*.nav.no` backends by default
(a non-overridable security floor). Add more origins with
`tracing: { propagateExtraOrigins: ['https://api.partner.example'] }`. Your backend
still has to allow the `traceparent` CORS header and export spans to Tempo — see
[frontend-to-backend trace propagation](trace-propagation.md).

## Pages Router

The Pages Router (`pages/`) — including navikt's golden-path Next.js template —
works the same way, with two differences: **where you initialize** and **how you
track routes**.

### Initialize in `_app.tsx`

There's no `instrumentation-client.ts`, so call `initNaisAPMClient` at module
scope in your custom `App`. It no-ops on the server and is idempotent, so
top-level is fine:

```tsx
// pages/_app.tsx
import type { AppProps } from 'next/app';
import { initNaisAPMClient, ApmErrorBoundary } from '@nais/apm/react';

initNaisAPMClient({ namespace: 'my-team' });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ApmErrorBoundary fallback={<p>Noe gikk galt.</p>}>
      <Component {...pageProps} />
    </ApmErrorBoundary>
  );
}
```

### Track routes with the router events

The Pages Router exposes navigation through `next/router` events instead of
`usePathname()`. Feed the new path into the same hook:

```tsx
// pages/_app.tsx
import { useRouter } from 'next/router';
import { useApmRouteTracking } from '@nais/apm/react';

function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  useApmRouteTracking(router.asPath);
  // ...render as above
}
```

Tracing (`tracing: true`) and the error boundary work identically to the App
Router.

## Ship readable stack traces

Production stack traces point at minified JavaScript. The Nais telemetry collector
maps them back to your source **server-side** by fetching your `.map` files from
the CDN — no upload step, no auth token. You only need to emit sourcemaps and ship
them alongside your bundle.

For Next.js, enable browser sourcemaps and follow the CDN requirement in
[Sourcemap deobfuscation](sourcemaps.md):

```js
// next.config.js
module.exports = {
  productionBrowserSourceMaps: true,
};
```

!!! warning "Server-rendered assets don't get deobfuscated"
    Sourcemap resolution only works for bundles served from `cdn.nav.no`. A purely
    server-rendered Next app that serves its own JS from the pod won't get resolved
    stack traces unless it also ships static assets to the CDN. See
    [Sourcemaps → Requirements](sourcemaps.md#requirements).

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
- [React + Vite quickstart](quickstart-react-vite.md) — for React SPAs.
- [Migrate from Sentry to `@nais/apm`](migrate-from-sentry.md) — call-site-by-call-site.
- [`@nais/apm` API reference](../../apm/reference/apm-client-api.md) — every export and option.
- [Sourcemap deobfuscation](sourcemaps.md) · [Trace propagation](trace-propagation.md)

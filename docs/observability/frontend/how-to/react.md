---
description: >-
  Instrument React and Next.js apps with @nais/apm — error boundaries that
  become fingerprinted issues, route tracking, and browser tracing.
tags: [how-to, observability, frontend, react, next.js]
---

# React &amp; Next.js with `@nais/apm`

{% if tenant() == "nav" %}
The [`@nais/apm`](../../apm/reference/apm-client-api.md) SDK ships a separate
React entry point, **`@nais/apm/react`**, with helpers for React and Next.js
apps: an error boundary that turns a render crash into a fingerprinted issue in
Nais APM, route-change tracking for React Router v6 and the Next.js App Router,
and a server-safe Next.js client-init helper.

The React entry keeps the root `@nais/apm` import free of React and the tracing
dependency tree — you only pull those in if you import `@nais/apm/react`. React
and `react-router` are **optional peer dependencies**: importing this entry
requires them (plus `@grafana/faro-react` for the React Router v6 wiring).

!!! note "Prerequisite"
    Set up `@nais/apm` first — see
    [Track frontend errors with `@nais/apm`](../../apm/tutorials/track-frontend-errors.md).
    The helpers below assume `init()` has run.

## Install

```sh
pnpm add @nais/apm
# or: npm install @nais/apm / yarn add @nais/apm
```

The React helpers rely on peer dependencies you almost certainly already have:
`react` (and `react-dom`), plus `react-router-dom` (v6) and `@grafana/faro-react`
if you use the React Router v6 route tracking below.

## Catch render errors with `ApmErrorBoundary`

A React render error thrown below a component is otherwise silently swallowed —
it never reaches `window.onerror`, so `@nais/apm` can't see it. Wrap your app
(or a route subtree) in `ApmErrorBoundary`: it catches the error, reports it
**exactly once** through `captureException` (so it gets the SDK's fingerprint
and global context pipeline, with the React component stack attached), and
renders a fallback.

```tsx
import { ApmErrorBoundary } from '@nais/apm/react';

export function App() {
  return (
    <ApmErrorBoundary fallback={<p>Something went wrong.</p>}>
      <Router />
    </ApmErrorBoundary>
  );
}
```

Wrap route subtrees rather than only the root when you want a crash in one
area to leave the rest of the app usable:

```tsx
<Layout>
  <ApmErrorBoundary fingerprint="checkout" fallback={<CheckoutError />}>
    <Checkout />
  </ApmErrorBoundary>
</Layout>
```

### Props

| Prop | Type | Description |
| ---- | ---- | ----------- |
| `fallback` | `ReactNode \| (error, resetError) => ReactNode` | What to render after a catch. A node, or a render function that receives the error and a `resetError` callback. Defaults to a minimal `role="alert"` message. |
| `fingerprint` | `string \| (error) => string` | Custom grouping key, passed to `captureException` (maps to `context.fingerprint`). A function receives the caught error so grouping can depend on it. |
| `context` | `Record<string, unknown>` | Extra context merged into the captured exception. |
| `onError` | `(error, errorInfo) => void` | Called after the error has been captured. |
| `onReset` | `(error \| null) => void` | Called when the boundary is reset via the render-prop `resetError`. |

The render-prop `fallback` lets you offer a retry that clears the error state:

```tsx
<ApmErrorBoundary
  fallback={(error, resetError) => (
    <div role="alert">
      <p>Could not load this view.</p>
      <button onClick={resetError}>Try again</button>
    </div>
  )}
>
  <Report />
</ApmErrorBoundary>
```

### `withApmErrorBoundary` HOC

To wrap a component without editing its JSX, use the HOC — a Sentry-compatible
`withErrorBoundary` shape:

```tsx
import { withApmErrorBoundary } from '@nais/apm/react';

const SafeReport = withApmErrorBoundary(Report, { fingerprint: 'report' });
```

Errors caught by the boundary land on the **Issues** tab of your app in Nais
APM, grouped by fingerprint, side by side with backend errors.

![Nais APM Issues tab filtered to browser-sourced exceptions](../../../assets/nais-apm-service-navno-issues-frontend.png)

## Track route changes

Single-page apps navigate without a full page load, so Faro's default pageload
instrumentation only sees the first route. Add route tracking so each in-app
navigation is recorded — this is what powers per-page performance and session
navigation trails in APM.

### React Router v6

Call `enableApmReactRouterV6` **once after `init()`**, passing your app's own
`react-router-dom` exports (the SDK does not import react-router itself, so it
stays an optional peer with no version drift). Then render `<ApmRoutes>` wherever
you would render `<Routes>`:

```tsx
import {
  createRoutesFromChildren,
  matchRoutes,
  Routes,
  useLocation,
  useNavigationType,
} from 'react-router-dom';
import { enableApmReactRouterV6, ApmRoutes } from '@nais/apm/react';

enableApmReactRouterV6({
  createRoutesFromChildren,
  matchRoutes,
  Routes,
  useLocation,
  useNavigationType,
});

export function AppRoutes() {
  return (
    <ApmRoutes>
      <Route path="/" element={<Home />} />
      <Route path="/reports/:id" element={<Report />} />
    </ApmRoutes>
  );
}
```

`ApmRoutes` is a drop-in for `<Routes>` that reports a route-change event on each
navigation. React Router v5/v7 and the data-router variants are follow-ups.

### Next.js App Router

There is no faro-react integration for the Next.js App Router, so `@nais/apm`
ships a small hook, `useApmRouteTracking`. Call it in a **client component** with
Next's navigation hooks; it pushes a route-change event whenever the pathname (or
search) changes:

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

Render it once, high in your tree (e.g. in the root `app/layout.tsx`). Passing
the values in — rather than importing `next/navigation` inside the SDK — keeps
Next out of the package's dependency tree and makes the hook usable with any
router that can supply a pathname.

## Next.js setup

Use `initNaisAPMClient` as the client entry. It is the documented entry for the
Next 15+ [`instrumentation-client.ts`](https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation-client)
file and the Pages Router `_app.tsx` pattern:

```ts
// instrumentation-client.ts (Next 15+)
import { initNaisAPMClient } from '@nais/apm/react';

initNaisAPMClient({ namespace: 'my-team' });
```

```tsx
// pages/_app.tsx (Pages Router)
import type { AppProps } from 'next/app';
import { initNaisAPMClient } from '@nais/apm/react';

initNaisAPMClient({ namespace: 'my-team' });

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
```

`initNaisAPMClient` takes the same options as [`init()`](../../apm/reference/apm-client-api.md)
(including `tracing`), and adds two Next-specific guarantees:

- **Server-safe** — it no-ops when `window` is undefined, so you can import it
  into modules that also run in React Server Components or during SSR without a
  reference error. It returns the Faro instance in the browser, or `undefined`
  on the server.
- **Init-once** — `init()` already self-guards against double initialization, so
  React StrictMode's double-invoke or repeated imports return the existing
  instance instead of re-initializing.

!!! warning "`namespace` is required"
    Nais APM attributes all telemetry by team, so pass your nais team as
    `namespace` (it maps to the `app_namespace` field). On a static frontend the
    platform can inject it via a `<meta name="nais-team">` tag or the `NAIS_TEAM`
    env, but for SSR/Next apps set it explicitly. Without it the SDK loud-warns
    and falls back to `unknown-team` — it never throws.

## Enable browser tracing

Turn on distributed tracing for a React or Next.js app with a single option —
it works the same everywhere `init()` runs, including `initNaisAPMClient`:

```ts
initNaisAPMClient({ namespace: 'my-team', tracing: true });
```

This connects browser spans to your backend traces in Tempo. See
[Frontend-to-backend trace propagation](trace-propagation.md#recommended-enable-tracing-with-naisapm)
for the full story, including the trace-header propagation security model.

## Keep user ids opaque

`setUser` is the developer's responsibility — `@nais/apm` scrubs fødselsnummer,
emails, and token URL parameters from outgoing signals, but the id you pass to
`setUser` is trusted. Pass only an **opaque, non-identifying** correlation key
(a salted hash), never a raw NAV ident, fødselsnummer, email, or name — every
team shares the same Loki instance.

```ts
import { setUser, clearUser } from '@nais/apm';

setUser({ id: hashedSubject }); // hashedSubject = a salted hash, NOT an ident/fnr/email
// ... on logout:
clearUser();
```

See [Privacy: PII scrubbing](../../apm/reference/apm-client-api.md#privacy-pii-scrubbing)
for exactly what the mandatory scrubber covers.

## Related

- [Track frontend errors with `@nais/apm`](../../apm/tutorials/track-frontend-errors.md) — install and initialize the SDK
- [`@nais/apm` API reference](../../apm/reference/apm-client-api.md) — every export and option
- [Frontend-to-backend trace propagation](trace-propagation.md) — enable and verify distributed traces
- [View errors on the Issues tab](../../apm/tutorials/get-started.md#3-check-the-issues-tab) and [browser data on the Frontend tab](../../apm/tutorials/get-started.md#4-look-at-backend-database-and-frontend) in Nais APM
{% else %}
On tenants where `@nais/apm` is not yet available, instrument React apps with the
underlying [`@grafana/faro-react`](https://www.npmjs.com/package/@grafana/faro-react)
package directly:

- [`<FaroErrorBoundary>`](setup-faro.md#react-error-boundaries) — catch React render errors
- [`<FaroRoutes>` and the Next.js error-boundary pattern](setup-nextjs.md#react-integration-package) — route tracking and Next.js integration
- [Trace propagation](trace-propagation.md) — connect browser traces to backend spans
{% endif %}

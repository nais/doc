---
title: Migrate from Sentry to @nais/apm
description: >-
  Move a frontend app off @sentry/* and onto the @nais/apm SDK — a clean, full
  migration with a concept map, a copy-pasteable recipe, and an honest list of
  what is different and what is not supported yet.
tags: [how-to, observability, frontend, apm, sentry, migration]
conditional: [tenant, nav]
---

# Migrate from Sentry to `@nais/apm`

This guide takes a frontend app off Sentry (`@sentry/browser`, `@sentry/react`,
`@sentry/nextjs`, …) and onto [`@nais/apm`](../../apm/tutorials/track-frontend-errors.md),
the Nais browser telemetry SDK. Your errors stop going to `sentry.gc.nav.no` and
start showing up as issues in [Nais APM](../../apm/README.md), on your team's own
Grafana stack.

## Who this is for

You're on this page if your app calls `Sentry.init` and friends today. Many of
these apps also already run [Grafana Faro](../../frontend/README.md) alongside
Sentry — `@nais/apm` is a thin, opinionated wrapper over Faro with a Sentry-like
developer experience, so if that's you, this migration also collapses two SDKs
into one.

The end state is **idiomatic `@nais/apm`** with Sentry **fully removed**: no
`@sentry/*` dependency, no DSN, no `withSentryConfig`, no `SENTRY_AUTH_TOKEN`.

!!! info "Not a compatibility shim"
    There is deliberately no `Sentry`-named drop-in. `@nais/apm` gives you the
    same *shapes* (`captureException`, `setUser`, an error boundary) under its own
    names, so you migrate call sites once and delete Sentry for good. A handful of
    Sentry features have no equivalent yet — see
    [What's different](#whats-different-read-this) before you start.

!!! note "Status: pre-release"
    `@nais/apm` is pre-1.0. Pin an exact version and read the
    [CHANGELOG](https://github.com/nais/apm/blob/main/CHANGELOG.md) before
    upgrading. This guide targets `0.2.0`.

## Concept map

| Sentry | `@nais/apm` | Notes |
| ------ | ----------- | ----- |
| `Sentry.init({ dsn, ... })` | [`init()`](../../apm/reference/apm-client-api.md#initoptions) / [`initNaisAPMClient()`](../../apm/tutorials/track-frontend-errors.md#3-initialize-zero-config) | Zero-config on Nais — **no DSN**. App name, version, environment, collector URL all resolve automatically. |
| `Sentry.captureException(e)` | `captureException(e, { context, fingerprint })` | Returns **`void`** — no event ID (see [What's different](#no-event-id-from-captureexception)). |
| `Sentry.captureMessage(m, level)` | `captureMessage(m, level)` | Same severity levels. |
| `Sentry.setUser({ id })` | `setUser({ id })` | **PII is dropped.** Opaque/hashed ids only — [see below](#setuser-drops-pii). |
| `Sentry.setUser(null)` | `clearUser()` | On logout. |
| `Sentry.setTag(k, v)` | `setTag(k, v)` | Approximation — rides as context, **not** an indexed label. |
| `Sentry.setContext(name, obj)` | `setContext(name, obj)` | Flattened as `name.key`; `setContext(name, null)` removes it. |
| `Sentry.setExtra(k, v)` | `setContext(name, obj)` | No `setExtra` — fold extras into a named context. |
| `Sentry.ErrorBoundary` | [`ApmErrorBoundary`](../../apm/reference/apm-client-api.md) | From `@nais/apm/react`. |
| `Sentry.withErrorBoundary(C)` | `withApmErrorBoundary(C)` | HOC form. |
| React Router integration | `enableApmReactRouterV6()` + `<ApmRoutes>` | React Router v6. |
| `Sentry.captureRouterTransitionStart` (Next.js) | `useApmRouteTracking()` hook | Next.js App Router. |
| `browserTracingIntegration` / `tracesSampleRate` | `init({ tracing: true })` | On/off; auto-instruments fetch/XHR. See [trace propagation](trace-propagation.md). |
| `replayIntegration()` | `init({ sessionReplay: { enabled: true } })` | Defaults to the **events tier** (no DOM) — [see below](#replay-defaults-to-the-events-tier). |
| `ignoreErrors: [...]` | `init({ ignoreErrors: [...] })` | Appended to `DEFAULT_IGNORE_ERRORS` (extensions, ResizeObserver, `Script error.`). |
| `beforeSend(event)` | `init({ beforeSend })` | Runs **before** the mandatory PII scrubber. |
| `@sentry/webpack-plugin` / `withSentryConfig` sourcemap upload | *(nothing to configure)* | Stack traces resolve **server-side** from the CDN — [sourcemaps](sourcemaps.md). |
| `Sentry.showReportDialog` / User Feedback | `captureFeedback()` | Programmatic, **preview/internal-pilot only**, no built-in widget. |
| Sentry Issues UI | [Issues tab](../../apm/tutorials/get-started.md#3-check-the-issues-tab) in Nais APM | Different triage model — [triage an issue](../../apm/how-to/triage-an-issue.md). |
| Sentry Alerts | [Grafana alerts](../../apm/how-to/create-alerts.md) | Built from templates, delivered via Grafana contact points. |
| `release: process.env.…` | `version` (auto) | Resolved from `GITHUB_SHA` / image tag; joins deploy markers. |

## Step-by-step recipe

### 1. Remove Sentry

Drop every `@sentry/*` package and its config from `package.json`:

```sh
npm uninstall @sentry/browser @sentry/react @sentry/nextjs @sentry/webpack-plugin
```

Delete the DSN and auth-token wiring while you're here — you won't need them:

- `NEXT_PUBLIC_SENTRY_DSN` / `SENTRY_DSN` env and secrets
- `SENTRY_AUTH_TOKEN` (CI secret used for sourcemap upload)
- any `sentry.client.config.*` / `sentry.server.config.*` / `sentry.edge.config.*`

### 2. Add `@nais/apm`

`@nais/apm` is published to the GitHub Package Registry. Configure the registry
(one-time, in `.npmrc`) and install — the full steps are in
[Track frontend errors](../../apm/tutorials/track-frontend-errors.md#1-configure-the-package-registry):

```sh
npm install @nais/apm@0.2.0
```

The React helpers (error boundary, route tracking, Next.js client init) live in
the `@nais/apm/react` entry point.

### 3. Swap `Sentry.init` → `init()`

There is no DSN and, on Nais, nothing to configure — `init()` reads the app name,
version, environment, team, and collector URL from the Nais
[meta tags / `NAIS_*` env](../../apm/reference/apm-client-api.md#configuration-resolution).

=== "React / Vite"

    **Before** (`initSentry.ts`, real navikt shape):

    ```ts
    import * as Sentry from '@sentry/browser';

    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      release: import.meta.env.VITE_SENTRY_RELEASE,
      environment: globalThis.location.hostname,
      integrations: [Sentry.breadcrumbsIntegration({ console: false })],
      ignoreErrors: ['TypeError: Failed to fetch'],
      beforeSend: (event) => (isNoise(event) ? null : event),
    });
    ```

    **After** (`main.tsx`):

    ```ts
    import { init } from '@nais/apm';

    init({
      // app / version / environment / namespace all resolve from Nais — omit them.
      ignoreErrors: [/Failed to fetch/],
      beforeSend: (item) => (isNoise(item) ? null : item),
    });
    ```

=== "Next.js (App Router)"

    **Before** (`instrumentation-client.ts`, real navikt shape):

    ```ts
    import * as Sentry from '@sentry/nextjs';

    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      release: process.env.NEXT_PUBLIC_APP_VERSION,
      allowUrls: ['arbeidsplassen.nav.no'],
      ignoreErrors: ['TypeError: Failed to fetch'],
      beforeSend(event, hint) { return isNoise(hint) ? null : event; },
    });

    export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
    ```

    **After** (`instrumentation-client.ts`):

    ```ts
    import { initNaisAPMClient } from '@nais/apm/react';

    initNaisAPMClient({
      namespace: 'my-team', // or resolved from a <meta name="nais-team"> tag / NAIS_TEAM
      ignoreErrors: [/Failed to fetch/],
      tracing: true, // optional — see step 5
    });
    ```

    `initNaisAPMClient` no-ops on the server and is idempotent under React Strict
    Mode, so it's safe to import from `instrumentation-client.ts` (Next 15+) or a
    Pages Router `_app.tsx`. Route tracking replaces `onRouterTransitionStart` —
    see step 4.

!!! tip "`beforeSend` semantics changed"
    In Sentry your `beforeSend` was the last word. In `@nais/apm` it runs **first**;
    the mandatory PII scrubber always runs **last** and cannot be removed (only
    `dangerouslyDisablePiiScrubbing: true` disables it, and then your team owns the
    GDPR consequences). You usually no longer need `allowUrls` / manual noise
    filters for extensions and `ResizeObserver` — those are in `DEFAULT_IGNORE_ERRORS`.

### 4. Replace the error boundary and route tracking

**Error boundary** — swap `Sentry.ErrorBoundary` for `ApmErrorBoundary`:

```tsx
// Before
import * as Sentry from '@sentry/react';
<Sentry.ErrorBoundary fallback={<TekniskFeilSide />}>
  <App />
</Sentry.ErrorBoundary>

// After
import { ApmErrorBoundary } from '@nais/apm/react';
<ApmErrorBoundary fallback={<TekniskFeilSide />}>
  <App />
</ApmErrorBoundary>
```

`ApmErrorBoundary` reports through `captureException` exactly once, so caught
render errors get the SDK's fingerprint/context pipeline. The `withApmErrorBoundary(Component, props?)`
HOC mirrors `Sentry.withErrorBoundary`. The `fallback` can also be a render prop
`(error, resetError) => node`.

**Route tracking:**

=== "React Router v6"

    Call once after `init()`, passing your own `react-router-dom` exports, then
    render `<ApmRoutes>` where you rendered `<Routes>`:

    ```tsx
    import {
      createRoutesFromChildren, matchRoutes, Routes, useLocation, useNavigationType,
    } from 'react-router-dom';
    import { enableApmReactRouterV6, ApmRoutes } from '@nais/apm/react';

    enableApmReactRouterV6({
      createRoutesFromChildren, matchRoutes, Routes, useLocation, useNavigationType,
    });

    // <ApmRoutes> instead of <Routes>
    ```

=== "Next.js (App Router)"

    Use the hook in a client component and mount it once in your layout:

    ```tsx
    'use client';
    import { usePathname, useSearchParams } from 'next/navigation';
    import { useApmRouteTracking } from '@nais/apm/react';

    export function ApmRouteTracker() {
      useApmRouteTracking(usePathname(), useSearchParams());
      return null;
    }
    ```

!!! warning "React Router v5/v7 and data routers are not wired yet"
    Route tracking currently covers **React Router v6** and the **Next.js App
    Router** only. See [What's different](#not-yet-supported).

### 5. Tracing (optional)

If you used `browserTracingIntegration` / `tracesSampleRate`, enable tracing with
one flag. `@grafana/faro-web-tracing` is lazily loaded so it stays out of your
bundle unless you turn it on:

```ts
init({ tracing: true });
```

Trace headers are propagated to your own origin and `*.nav.no` backends by
default (a non-overridable security floor). Add more with
`init({ tracing: { propagateExtraOrigins: ['https://api.partner.example'] } })`.
Your backend still needs to allow the `traceparent` CORS header — see
[frontend-to-backend trace propagation](trace-propagation.md).

### 6. Delete sourcemap upload

Remove the entire `@sentry/webpack-plugin` / `withSentryConfig` sourcemap-upload
step and the `SENTRY_AUTH_TOKEN` it needed:

```ts
// next.config.ts — DELETE the withSentryConfig wrapper
const nextConfig = withSentryConfig(baseConfig, {
  org: 'nav',
  project: 'my-app',
  sentryUrl: 'https://sentry.gc.nav.no/',
  authToken: process.env.SENTRY_AUTH_TOKEN,
});
export default nextConfig; // -> export default baseConfig;
```

There is **nothing to replace it with**. The Nais telemetry collector resolves
minified stack traces **server-side** by fetching your `.map` files from the CDN
(`cdn.nav.no`) at read time. You only need to *emit* sourcemaps and deploy them
alongside your bundle — no upload, no auth token. Follow
[Sourcemap deobfuscation](sourcemaps.md) for the build settings and the CDN
requirement.

### 7. Replace Sentry Replay

If you ran `replayIntegration()`, use `sessionReplay`:

```ts
init({ sessionReplay: { enabled: true, mode: 'on-error' } });
```

This defaults to the **events tier** — a DOM-free interaction timeline, safe by
construction. It is **not** a like-for-like replacement for Sentry's full DOM
recording; opting into DOM capture is a deliberate, personvernombud-gated
decision. Read [What's different](#replay-defaults-to-the-events-tier) and
[Enable session replay](../../apm/how-to/enable-session-replay.md) before you
turn anything on.

### 8. Move alerting to Grafana

Sentry alert rules don't come across. Recreate them as
[Grafana alerts from Nais APM templates](../../apm/how-to/create-alerts.md)
(error rate, exception spike, new exceptions, web vitals) — delivered through
your team's Grafana contact points.

## What's different (read this)

This is the honest section. A clean migration means understanding where
`@nais/apm` is deliberately *not* Sentry.

### No event ID from `captureException`

`Sentry.captureException` returns an event ID; `@nais/apm`'s returns `void` (a
Faro limitation). There is **no `lastEventId()`**. If any code relied on the
returned id — to show a reference code to the user, or to link a crash-report
dialog to an event — that pattern doesn't carry over. Use your own correlation id
(e.g. a `crypto.randomUUID()` you also attach as `context`) instead.

### `setUser` drops PII

This is the personvern rule, and it is enforced in code — call it out on your
team before you migrate. NAV telemetry lands in a **shared Loki instance that
every team can read**, so identities must never reach it. `setUser`:

- **drops** any `id` / `username` / `attributes` value that looks like a
  fødselsnummer, email, or raw NAV ident (and warns once);
- drops the `email` field **unconditionally** (it is deprecated).

Pass an **opaque, non-identifying** id — a salted hash, never a raw ident:

```ts
// Before (Sentry) — teams already hash, keep doing it:
Sentry.setUser({ id: hash(fnr) });

// After (@nais/apm) — same idea, PII is a hard floor:
setUser({ id: hash(fnr) }); // an ident/email/fnr passed here is silently dropped
```

The transport also runs a mandatory PII scrubber over every signal (fnr → `[fnr]`,
email → `[email]`, token URL params → `[redacted]`). It's a safety net, not a
GDPR guarantee — don't put personal data in error messages in the first place.

### Issues live in the Grafana Issues tab

Errors show up in the **Issues tab** of your service in
[Nais APM](<<tenant_url("grafana", "a/nais-apm-app/services")>>), not in
Sentry's issue stream. The [triage model](../../apm/how-to/triage-an-issue.md) is
different: Resolve / Ignore / Assign is shared team state stored in Grafana
annotations, a resolved issue that recurs after a newer deploy is flagged
**Regressed**, and you can personally **mute** without touching shared state.
Grouping is driven by [fingerprinting](../../apm/reference/issues-model.md) — pass
a `fingerprint` to `captureException` to control it, the same idea as Sentry's
`fingerprint`.

### Source maps resolve server-side

No `sentry-cli`, no `@sentry/webpack-plugin`, no upload step, no `SENTRY_AUTH_TOKEN`.
Deobfuscation happens in the collector by fetching `.map` files from `cdn.nav.no`.
The catch: it **only works for bundles served from the CDN**. A purely
server-rendered app that serves its own JS from the pod won't get resolved stack
traces unless it also ships static assets to the CDN. See
[Sourcemaps](sourcemaps.md#requirements).

### Alerts are Grafana alerts

Sentry's alert rules, notification integrations, and issue-owner routing don't
migrate. Alerting is Grafana alerting, seeded from
[Nais APM templates](../../apm/how-to/create-alerts.md). Note there's **no
SLO/burn-rate template yet**.

### Replay defaults to the events tier

Sentry Replay records the DOM. `@nais/apm`'s `sessionReplay: { enabled: true }`
defaults to the **events tier**: a lightweight interaction timeline (navigation,
clicks, coarse scroll) with **no DOM node tree** — structurally nothing to leak.
Full masked-DOM recording exists (`tier: 'dom'`) but pushes DOM into shared Loki
and is **gated on the personvernombud process** — do not enable it on
citizen-facing apps without sign-off. Replay is a **preview** feature and off by
default.

### Not yet supported

These Sentry features have **no `@nais/apm` equivalent** at `0.2.0`. State this
plainly to your team so nobody is surprised mid-migration:

| Sentry feature | Status in `@nais/apm` |
| -------------- | --------------------- |
| `addBreadcrumb()` / `beforeBreadcrumb` | **Not supported.** No manual breadcrumb API. The events-tier replay timeline captures interactions automatically, but you can't push custom breadcrumbs. |
| Manual spans / performance — `startSpan`, `startInactiveSpan`, `startTransaction` | **Not supported.** Tracing is on/off auto-instrumentation of fetch/XHR only; there is no manual span/transaction API. |
| Scopes — `withScope`, `configureScope`, `getCurrentScope` | **Not supported.** Context set via `setTag` / `setContext` is module-global; there's no per-scope isolation. |
| `setExtra` / `setExtras` / `setTags` (plural) | **Not supported.** Use `setTag` (single) and `setContext`. |
| `lastEventId()` | **Not supported** — `captureException` returns `void`. |
| `showReportDialog()` / crash-report modal | **Not supported.** `captureFeedback()` is programmatic and preview/internal-pilot only — no built-in widget. |
| Profiling, release-health/session tracking, attachments | **Not supported.** |
| React Router v5 / v7 / data routers | **Not yet** — v6 and Next.js App Router only. |

If you depend on one of these, note it before you delete Sentry, and track it
against the [`@nais/apm` CHANGELOG](https://github.com/nais/apm/blob/main/CHANGELOG.md).
`setTag` also differs subtly: Faro has no indexed tag concept, so a tag rides
along as **context** on every capture rather than as a searchable label.

## Migration checklist

- [ ] Removed every `@sentry/*` dependency from `package.json`.
- [ ] Deleted DSN env/secrets (`*_SENTRY_DSN`) and `SENTRY_AUTH_TOKEN`.
- [ ] Deleted `sentry.*.config.*` files and the `withSentryConfig` wrapper.
- [ ] Added `@nais/apm` (registry configured in `.npmrc`, exact version pinned).
- [ ] Swapped `Sentry.init` → `init()` / `initNaisAPMClient()`.
- [ ] Replaced `Sentry.ErrorBoundary` → `ApmErrorBoundary` (and `withErrorBoundary` → `withApmErrorBoundary`).
- [ ] Wired route tracking (`enableApmReactRouterV6` + `<ApmRoutes>`, or `useApmRouteTracking`).
- [ ] Migrated `captureException` / `captureMessage` / `setTag` / `setContext` call sites.
- [ ] Confirmed `setUser` only ever receives an **opaque/hashed** id — no fnr, email, or ident.
- [ ] Enabled `tracing: true` if you used `browserTracingIntegration` (and CORS allows `traceparent`).
- [ ] Removed sourcemap upload; verified `.map` files ship to the CDN ([sourcemaps](sourcemaps.md)).
- [ ] Recreated alerts as [Grafana alerts](../../apm/how-to/create-alerts.md).
- [ ] Audited [not-yet-supported](#not-yet-supported) features and logged any gaps.
- [ ] Deployed, triggered a test error, and confirmed it appears in the [Issues tab](../../apm/tutorials/track-frontend-errors.md#6-see-your-errors-as-issues).

## Related

- [Track frontend errors with `@nais/apm`](../../apm/tutorials/track-frontend-errors.md) — the from-scratch tutorial.
- [`@nais/apm` API reference](../../apm/reference/apm-client-api.md) — every export and option.
- [Sourcemap deobfuscation](sourcemaps.md) — how stack traces resolve.
- [Triage an issue](../../apm/how-to/triage-an-issue.md) · [Create alerts](../../apm/how-to/create-alerts.md)

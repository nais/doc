---
title: "@nais/apm API reference"
description: >-
  Every export, signature, and option of the @nais/apm browser SDK — init,
  captureException, captureMessage, setUser, setContext, captureFeedback, and more.
tags: [reference, observability, apm, frontend]
---

# `@nais/apm` API reference

`@nais/apm` wraps [`@grafana/faro-web-sdk`](https://github.com/grafana/faro-web-sdk)
with an ergonomic, capture-oriented API. This page documents the public API of
version `0.2.0`. For installation, see
[Track frontend errors with `@nais/apm`](../tutorials/track-frontend-errors.md);
for React, Next.js, and browser tracing, see
[React & Next.js with `@nais/apm`](../../frontend/how-to/react.md).

!!! note "Pre-1.0"
    The public API may change across `0.x` minor releases (new options, renamed
    fields, new exports such as tracing and React helpers). Pin an exact version
    and read the [CHANGELOG](https://github.com/nais/apm/blob/main/CHANGELOG.md)
    before upgrading.

## `init(options?)`

Initializes the SDK. Safe to call once — a second call warns and returns the
existing instance. Returns the underlying Faro instance.

```ts
init(options?: InitOptions): Faro
```

### `InitOptions`

All fields are optional. `app`, `version`, `environment`, and `telemetryUrl`
each resolve independently (see [Configuration resolution](#configuration-resolution)).

| Option | Type | Description |
| ------ | ---- | ----------- |
| `app` | `string` | Application name. |
| `version` | `string` | App version / release. Used for grouping and release tagging; also set as Faro `release`. |
| `environment` | `string` | Environment, e.g. `prod-gcp`. |
| `telemetryUrl` | `string` | Collector URL. |
| `beforeSend` | `(item) => item \| null` | Runs **before** the mandatory PII scrubber. Return `null` to drop the item. |
| `ignoreErrors` | `Patterns` | Extra patterns appended to `DEFAULT_IGNORE_ERRORS`. |
| `dangerouslyDisablePiiScrubbing` | `boolean` | Disables built-in PII scrubbing. See [Privacy](#privacy-pii-scrubbing). Default `false`. |
| `faro` | `Partial<BrowserConfig>` | Escape hatch: raw Faro overrides, merged last (except `beforeSend`, which stays composed with the scrubber). |
| `sessionReplay` | object | Opt-in session replay. See [`sessionReplay`](#init-options) below. |
| `screenshotOnError` | `boolean` | Opt-in masked DOM snapshot per new error. Off by default; auto-disabled when `sessionReplay` is enabled. |
| `tracing` | `boolean \| { propagateExtraOrigins?: (string \| RegExp)[] }` | Opt-in browser tracing. Off by default. `true` enables it with the mandatory propagation floor (same-origin + `*.nav.no`); pass an object to append extra origins. See [Browser tracing](#browser-tracing). |

`sessionReplay` fields: `enabled` (`boolean`), `mode` (`'on-error'` default, or
`'always'`), `sampleRate` (`0..1`, default `1`), `block` (`string[]`,
tighten-only). See [Enable session replay](../how-to/enable-session-replay.md).

```ts
init({
  app: 'my-app',
  version: '2026.07.04-abc1234',
  environment: 'prod-gcp',
  telemetryUrl: undefined, // usually omitted — resolved automatically on nais

  beforeSend: (item) => item,
  ignoreErrors: [/some noisy vendor error/],
  dangerouslyDisablePiiScrubbing: false,
  faro: {},

  sessionReplay: { enabled: false },
  screenshotOnError: false,
});
```

### Configuration resolution

Each of `app`, `version`, `environment`, and `telemetryUrl` resolves
independently, highest priority first:

1. **Explicit `init()` options.**
2. **Nais meta tags** in the served HTML:
   ```html
   <meta name="nais-app" content="my-app">
   <meta name="nais-cluster" content="prod-gcp">
   <meta name="nais-version" content="2026.07.03-abc1234">
   <meta name="nais-telemetry-url" content="https://telemetry.<tenant>.example/collect"> <!-- injected by the platform, not written by hand -->
   ```
3. **Build-time environment variables** — `NAIS_APP_NAME`, `NAIS_CLUSTER_NAME`,
   and a version derived from `NAIS_APP_IMAGE`'s tag (or `GITHUB_SHA`). These
   only work when your bundler inlines `process.env.*` (webpack `DefinePlugin`,
   Vite `define`, Next.js `env`).
4. **Collector fallback** — with no explicit or meta collector URL, well-known
   Nais collectors are derived from the cluster name (`prod-*` and `dev-*`).
5. **Dev mode** — if no collector URL resolves at all (typically localhost),
   nothing is sent; every signal is echoed to the console instead.

## `captureException(error, options?)`

Captures an exception. No event ID is returned (a Faro limitation).

```ts
captureException(error: unknown, options?: CaptureExceptionOptions): void
```

`CaptureExceptionOptions`: `context?` (`Record<string, unknown>`) and
`fingerprint?` (`string`, a custom grouping key).

```ts
captureException(e, {
  context: { orderId: '123' },
  fingerprint: 'checkout-timeout',
});
```

## `captureMessage(message, level?)`

```ts
captureMessage(message: string, level?: SeverityLevel): void
```

`SeverityLevel` is `'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug'`.

```ts
captureMessage('fallback flow used', 'warning');
```

## `setUser(user)` / `clearUser()`

```ts
setUser(user: User): void
clearUser(): void
```

`User`: `{ id?, email?, username? }`. Set a hashed subject as `id` where you can.

```ts
setUser({ id: hashedSubject, email: 'user@example.com', username: 'jdoe' });
// on logout:
clearUser();
```

## `setTag(key, value)`

Attaches a single key/value tag. Faro has no first-class tag concept, so the
value rides along as **context** on every subsequent capture rather than as an
indexed label.

```ts
setTag('featureFlag.newCheckout', true);
```

## `setContext(name, context)`

Attaches named context, flattened as `name.key`, to every subsequent capture.
Pass `null` to remove a previously set context.

```ts
setContext('order', { id: '123', total: 499 });
setContext('order', null); // remove it
```

## `captureFeedback(message, options?)`

Free-text user feedback capture.

!!! warning "Not yet available — internal pilot only"
    User feedback is **not part of the supported Nais APM feature set yet.**
    Free text flows into Loki, which is **shared across all teams and must never
    contain personal information**, so this is limited to internal applications
    during an internal pilot. If you wire it up, your feedback UI **must warn
    users not to enter any personal information** (names, fødselsnummer, contact
    details, case details). Do not use it on citizen-facing apps.

```ts
captureFeedback(message: string, options?: CaptureFeedbackOptions): void
```

`CaptureFeedbackOptions`: `category?` (`'bug' | 'idea' | 'other'`, default
`'other'`), `email?` (only sent when email-shaped), `fingerprint?` (joins to an
issue), `context?` (`Record<string, string>`, scrubbed like the message). The
message is scrubbed, trimmed, and capped at 4000 characters; empty messages are
dropped.

## `isInitialized()`

```ts
isInitialized(): boolean
```

```ts
if (!isInitialized()) init();
```

## `scrubString(value)`

Exposes the PII scrubber directly, e.g. to sanitize a string before you log it
yourself.

```ts
scrubString(value: string): string
```

```ts
console.log(scrubString('contact me at user@example.com'));
// -> "contact me at [email]"
```

## Privacy: PII scrubbing

Every outgoing signal — exception values, stack traces, log lines, context
values, and the page URL — passes through a `beforeSend` scrubbing pipeline
before it leaves the browser:

- **Norwegian fødselsnummer** (11 digits, date-prefix sanity-checked, including
  D-numbers, H-numbers, and synthetic test numbers) → `[fnr]`
- **Email addresses** → `[email]`
- **Token-bearing URL parameters** (`token`, `access_token`, `id_token`,
  `refresh_token`, `code`, `state`) → `[redacted]`

Your own `init({ beforeSend })` runs **first** and may drop items by returning
`null`; the scrubber always runs **last**, so it also sees anything your hook
added. Opting out requires an explicit
`init({ dangerouslyDisablePiiScrubbing: true })` — and then your team owns the
GDPR consequences of everything the app sends. Scrubbing is regex-based and
best-effort — a safety net, **not** a GDPR guarantee. Don't put personal data in
error messages in the first place.

## Local development

On `localhost` (or anywhere no collector URL resolves), `init()` warns once,
sends **nothing** over the network, and echoes every signal to the console.
Calling any capture function before `init()` is a safe no-op (with a single
warning).

## Browser tracing

Enable distributed tracing with `init({ tracing: true })`. This lazily loads
`@grafana/faro-web-tracing` (kept out of your bundle unless enabled) and
propagates W3C trace-context headers so browser spans join their backend traces
in Tempo.

Trace-header propagation is restricted by a **non-overridable floor**: headers
are only sent to the app's own origin and any `https://*.nav.no` host, so
`traceparent` never leaks to third-party origins. Extra origins are **appended**
via `propagateExtraOrigins` — they can never replace or empty the floor, and the
floor is not reachable through the `faro` escape hatch.

```ts
init({ tracing: { propagateExtraOrigins: [/https:\/\/api\.partner\.example\/.*/] } });
```

See [Frontend-to-backend trace propagation](../../frontend/how-to/trace-propagation.md#recommended-enable-tracing-with-naisapm).

## React entry — `@nais/apm/react`

A separate entry point, `@nais/apm/react`, exposes React helpers without pulling
React or the tracing tree into the root import: `ApmErrorBoundary` /
`withApmErrorBoundary` (report render errors once through `captureException`),
`ApmRoutes` / `enableApmReactRouterV6` and `useApmRouteTracking` (route-change
tracking for React Router v6 and the Next.js App Router), and `initNaisAPMClient`
(a server-safe, init-once Next.js client entry). React and `react-router` are
optional peer dependencies. See
[React & Next.js with `@nais/apm`](../../frontend/how-to/react.md).

## Supporting exports

Beyond the primary API, `@nais/apm` also exports `DEFAULT_IGNORE_ERRORS`,
`NaisConsoleInstrumentation` / `CONSOLE_ERROR_PREFIX` (the replacement console
instrumentation that captures `console.error('msg', err)` with a real stack
trace), `resolveConfig` / `versionFromImage`, `FEEDBACK_EVENT_NAME`, and
`VERSION`. Most apps never need these directly.

## Known limitations (0.2.0)

- Route tracking covers React Router v6 and the Next.js App Router; React Router v5/v7 and the data-router variants are follow-ups.
- Published to the GitHub Package Registry only.

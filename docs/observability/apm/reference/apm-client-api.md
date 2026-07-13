---
title: "@nais/apm API reference"
description: >-
  Every export, signature, and option of the @nais/apm browser SDK — init,
  captureException, captureMessage, setUser, setContext, captureFeedback, and more.
tags: [reference, observability, apm, frontend]
---

# `@nais/apm` API reference

`@nais/apm` wraps [`@grafana/faro-web-sdk`](https://github.com/grafana/faro-web-sdk)
with an ergonomic, capture-oriented API. For installation, see
[Track frontend errors with `@nais/apm`](../tutorials/track-frontend-errors.md).

<!--
  The version below is kept current by the `nais-apm-docs-version-sync` GitHub
  Actions workflow, which bumps every `@nais/apm@<semver>` install snippet under
  docs/observability/** and this marker whenever a new @nais/apm release ships.
  Do not reformat the marker — the workflow's sed matches it literally.
-->
Latest published release: **<!-- nais-apm-version:start -->0.5.0<!-- nais-apm-version:end -->** — pin this exact version when you install (pre-1.0, see the note below).

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

### InitOptions

All fields are optional to pass, though `namespace` is effectively required (see
its row below). `app`, `namespace`, `version`, `environment`, and `telemetryUrl`
each resolve independently (see [Configuration resolution](#configuration-resolution)).

| Option | Type | Description |
| ------ | ---- | ----------- |
| `app` | `string` | Application name. |
| `namespace` | `string` | The nais team (Kubernetes namespace) that owns the app. **Effectively required** — the plugin attributes all telemetry by team, so without it telemetry resolves to `unknown-team` and can't be tied to your app. Resolves from `<meta name="nais-team">` / `nais-namespace` or `NAIS_TEAM` / `NAIS_NAMESPACE` when omitted. |
| `version` | `string` | App version / release. Used for grouping and release tagging; also set as Faro `release`. |
| `environment` | `string` | Environment, e.g. `prod-gcp`. |
| `telemetryUrl` | `string` | Collector URL. |
| `beforeSend` | `(item) => item \| null` | Runs **before** the mandatory PII scrubber. Return `null` to drop the item. |
| `ignoreErrors` | `Patterns` | Extra patterns appended to `DEFAULT_IGNORE_ERRORS`. |
| `dangerouslyDisablePiiScrubbing` | `boolean` | Disables built-in PII scrubbing. See [Privacy](#privacy-pii-scrubbing). Default `false`. |
| `faro` | `Partial<BrowserConfig>` | Escape hatch: raw Faro overrides, merged last (except `beforeSend`, which stays composed with the scrubber). |
| `sessionReplay` | object | Opt-in session replay. See [`sessionReplay`](#initoptions) below. |
| `screenshotOnError` | `boolean` | Opt-in masked DOM snapshot per new error. Off by default; auto-disabled when `sessionReplay` is enabled. |

`sessionReplay` fields: `enabled` (`boolean`), `mode` (`'on-error'` default, or
`'always'`), `sampleRate` (`0..1`, default `1`), `block` (`string[]`,
tighten-only). See [Enable session replay](../how-to/enable-session-replay.md).

```ts
init({
  app: 'my-app',
  namespace: 'my-team', // the nais team that owns this app — effectively required
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

Each of `app`, `namespace`, `version`, `environment`, and `telemetryUrl`
resolves independently, highest priority first:

1. **Explicit `init()` options.**
2. **Nais meta tags** in the served HTML:
   ```html
   <meta name="nais-app" content="my-app">
   <meta name="nais-team" content="my-team"> <!-- or nais-namespace -->
   <meta name="nais-cluster" content="prod-gcp">
   <meta name="nais-version" content="2026.07.03-abc1234">
   <meta name="nais-telemetry-url" content="https://telemetry.<tenant>.example/collect"> <!-- injected by the platform, not written by hand -->
   ```
3. **Build-time environment variables** — `NAIS_APP_NAME`, `NAIS_TEAM` (or
   `NAIS_NAMESPACE`), `NAIS_CLUSTER_NAME`, and a version derived from
   `NAIS_APP_IMAGE`'s tag (or `GITHUB_SHA`). These only work when your bundler
   inlines `process.env.*` (webpack `DefinePlugin`, Vite `define`, Next.js
   `env`).
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

`User`: `{ id?, email?, username? }`. Pass an **opaque, non-identifying**
`id` only — see [`setUser` and user identity](#setuser-and-user-identity).

```ts
setUser({ id: hashedSubject }); // opaque id only — email/username/idents are dropped
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

### setUser and user identity

Telemetry lands in a **shared Loki instance that every team can read**, so a
user's identity must never reach it. `setUser` enforces this in code — it is not
a convention you can opt out of:

- it **drops** any `id` / `username` / `attributes` value that looks like a
  fødselsnummer, email, or raw NAV ident (and warns once);
- it drops the `email` field **unconditionally** (it is deprecated).

Pass an **opaque, non-identifying** id — a salted hash, never a raw ident:

```ts
setUser({ id: hash(fnr) }); // an ident/email/fnr passed here is silently dropped
```

## Local development

On `localhost` (or anywhere no collector URL resolves), `init()` warns once,
sends **nothing** over the network, and echoes every signal to the console.
Calling any capture function before `init()` is a safe no-op (with a single
warning).

## Supporting exports

Beyond the primary API, `@nais/apm` also exports `DEFAULT_IGNORE_ERRORS`,
`NaisConsoleInstrumentation` / `CONSOLE_ERROR_PREFIX` (the replacement console
instrumentation that captures `console.error('msg', err)` with a real stack
trace), `resolveConfig` / `versionFromImage`, `FEEDBACK_EVENT_NAME`, and
`VERSION`. Most apps never need these directly.

## Limitations & differences from Sentry

`@nais/apm` gives you Sentry-shaped ergonomics but is deliberately **not** a
drop-in for the whole Sentry API. This is the canonical list of what differs and
what has no equivalent — migrating off Sentry? Read it before you delete
`@sentry/*`.

### Behaves differently

- **No event ID from `captureException`.** `Sentry.captureException` returns an
  event ID; `@nais/apm`'s `captureException` returns `void` (a Faro limitation),
  and there is no `lastEventId()`. Any
  pattern that relied on the returned id — showing a reference code to the user,
  wiring a crash-report dialog (`showReportDialog`) to an event — does not carry
  over. Use your own correlation id (e.g. a `crypto.randomUUID()` you also attach
  as `context`) instead.
- **`setTag` is context, not an indexed label.** Faro has no first-class tag
  concept, so a `setTag` value rides along as **context** on every subsequent
  capture rather than as a searchable, indexed label.
- **`setUser` drops PII.** Only opaque/hashed ids survive — see
  [`setUser` and user identity](#setuser-and-user-identity).
- **Replay is a preview feature and defaults to the events tier.**
  `sessionReplay: { enabled: true }` records a DOM-free interaction timeline, not
  Sentry's full DOM recording. Full masked-DOM capture (`tier: 'dom'`) pushes DOM
  into shared Loki and is gated on the personvernombud process. Replay is off by
  default. See [Enable session replay](../how-to/enable-session-replay.md).
- **No bundler plugin or source-map upload.** There is no `@sentry/webpack-plugin`
  / `withSentryConfig` equivalent and no `SENTRY_AUTH_TOKEN`. Minified stack
  traces are resolved **server-side** by the platform collector from `.map` files
  on the CDN — you only emit and deploy sourcemaps, nothing to upload. See
  [Sourcemap deobfuscation](../../frontend/how-to/sourcemaps.md).

### Deliberately unsupported Sentry APIs

These have **no `@nais/apm` equivalent**:

| Sentry API | Notes |
| ---------- | ----- |
| `addBreadcrumb()` / `beforeBreadcrumb` | No manual breadcrumb API. The events-tier replay timeline captures interactions automatically, but you can't push custom breadcrumbs. |
| `withScope` / `configureScope` / `getCurrentScope` | No per-scope isolation. Context set via `setTag` / `setContext` is module-global. |
| `startSpan` / `startInactiveSpan` / `startTransaction` | No manual span/transaction API. Tracing is on/off auto-instrumentation of fetch/XHR only. |
| `setExtra` / `setExtras` / `setTags` (plural) | Use `setTag` (single) and `setContext`. |
| `lastEventId()` | `captureException` returns `void`. |
| `showReportDialog()` / crash-report modal | `captureFeedback()` is programmatic and preview/internal-pilot only — no built-in widget. |
| `withProfiler` / profiling, release-health / session tracking, attachments | Not supported. |
| React Router v5 / v7 and data routers | Route tracking covers React Router v6 and the Next.js App Router only. |

If you depend on one of these, log it before you delete Sentry and track it
against the [`@nais/apm` CHANGELOG](https://github.com/nais/apm/blob/main/CHANGELOG.md).

---
description: >-
  Frontend observability with Grafana Faro gives you real user monitoring,
  performance metrics, error tracking, and tracing for browser applications.
tags: [explanation, observability, frontend, services]
---

# Frontend observability

Nais provides frontend observability through the [Grafana Faro Web SDK][faro-web-sdk]. Faro runs in the browser and instruments your app, shipping telemetry through the platform collector (**Alloy**) into the shared observability stores: errors and events land in **Loki**, browser spans in **Tempo**, and Core Web Vitals in **Mimir**. You then view and triage it all in [Nais APM](https://grafana.<<tenant()>>.cloud.nais.io/a/nais-apm-app).

[faro-web-sdk]: https://www.npmjs.com/package/@grafana/faro-web-sdk

With 95+ applications already using Faro, it's the standard way to monitor frontend applications on Nais.

{% if tenant() == "nav" %}
!!! tip "Recommended: instrument with `@nais/apm`"
    The recommended way to add Faro to a browser app is the
    [`@nais/apm`](../apm/reference/apm-client-api.md) SDK — a thin Faro wrapper
    with **zero-config `init()`**, **mandatory PII scrubbing**, a required
    `namespace`, and a fixed console instrumentation that keeps real stack
    traces. It's the *instrument* half of Nais APM: add `@nais/apm`, then
    **view and triage** the results on the APM [Frontend](../apm/tutorials/get-started.md#4-look-at-backend-database-and-frontend)
    and [Issues](../apm/tutorials/get-started.md#3-check-the-issues-tab) tabs.

    Start with [Track frontend errors with `@nais/apm`](../apm/tutorials/track-frontend-errors.md).
    Reach for raw Faro (the guides below) when you need something `@nais/apm`
    doesn't cover yet — most notably [trace propagation](how-to/trace-propagation.md),
    which the `0.1.0` SDK doesn't wrap.
{% endif %}

## What you get

<!-- SCREENSHOT: Nais APM Frontend tab — Core Web Vitals (LCP, INP, CLS) big numbers with threshold bands (good/needs-improvement/poor), pageloads, and per-page performance for a Faro-instrumented app. Replaces the stale standalone web-vitals dashboard. -->

- **[Core Web Vitals](https://web.dev/vitals/)** — TTFB, FCP, CLS, LCP, INP (collected automatically)
- **Logging** — `console.info`, `console.warn`, and `console.error` messages
- **Exceptions** — stack traces with [automatic sourcemap deobfuscation](how-to/sourcemaps.md)
- **Custom events and metrics** — anything you want to track
- **[Tracing](how-to/trace-propagation.md)** — OpenTelemetry-based browser traces, optionally connected to backend spans

## Get started

{% if tenant() == "nav" %}
1. **Recommended — errors as issues in APM:** [:dart: Track frontend errors with `@nais/apm`](../apm/tutorials/track-frontend-errors.md)
2. **Any frontend app (raw Faro):** [:dart: Set up Faro](how-to/setup-faro.md)
3. **Next.js App Router:** [:simple-nextdotjs: Set up Faro with Next.js](how-to/setup-nextjs.md)
4. **Want end-to-end traces?** [Connect frontend to backend](how-to/trace-propagation.md)
5. **Stack traces look minified?** [Sourcemaps](how-to/sourcemaps.md) · [Troubleshooting](reference/troubleshooting.md)
{% else %}
1. **Any frontend app:** [:dart: Set up Faro](how-to/setup-faro.md)
2. **Next.js App Router:** [:simple-nextdotjs: Set up Faro with Next.js](how-to/setup-nextjs.md)
3. **Want end-to-end traces?** [Connect frontend to backend](how-to/trace-propagation.md)
4. **Stack traces look minified?** [Sourcemaps](how-to/sourcemaps.md) · [Troubleshooting](reference/troubleshooting.md)
{% endif %}

## Recommended configuration

After the basic setup, check that you have these configured:

| Setting | Why it matters | Guide |
| ------- | -------------- | ----- |
| `beforeSend` PII filtering | Faro captures URLs and console output that may contain fødselsnummer or tokens | [Privacy and sensitive data](how-to/setup-faro.md#privacy-and-sensitive-data) |
| `propagateTraceHeaderCorsUrls` | Without this, browser traces never connect to your backend spans | [Trace propagation](how-to/trace-propagation.md) |
| `paused` on localhost | Prevents local development noise from polluting production dashboards | [Local development](how-to/setup-faro.md#local-development) |
| `app.version` | Lets you filter errors and metrics by deploy | [Setting app.version](how-to/setup-faro.md#setting-appversion) |
| Error boundary | Catches React rendering errors that are otherwise silently lost | [React error boundaries](how-to/setup-faro.md#react-error-boundaries) |

## Collector endpoints

The collector URL tells Faro where to send telemetry data. If you use the [auto-configuration](how-to/setup-faro.md#auto-configuration) in `nais.yaml`, this is set for you.

{% if tenant() == "nav" %}
| Collector endpoint                             | Environment |
| ---------------------------------------------- | ----------- |
| `https://telemetry.nav.no/collect`             | `prod`      |
| `https://telemetry.ekstern.dev.nav.no/collect` | `dev`       |
{% else %}
| Collector endpoint                                     | Environment |
| ------------------------------------------------------ | ----------- |
| `<<tenant_url("telemetry.external.prod", "collect")>>` | `prod`      |
| `<<tenant_url("telemetry.external.dev", "collect")>>`  | `dev`       |
{% endif %}

On-premises clusters are not supported.

## Inspecting frontend data in Grafana

Find your app in the [Nais APM](https://grafana.<<tenant()>>.cloud.nais.io/a/nais-apm-app/services) service inventory and open it. Browser telemetry surfaces on two tabs:

- **Frontend** — Core Web Vitals, pageloads, sessions, per-page performance, browser breakdown, and web-vitals attribution (what's driving LCP, INP, and CLS).
- **Issues** — browser exceptions grouped into issues, side by side with backend errors. Filter the source to **Browser** to isolate frontend errors, then open an issue for its stack trace and impact.

<!-- SCREENSHOT: Nais APM service detail — Frontend tab active, Core Web Vitals with threshold bands plus web-vitals attribution. Replaces the stale service-list-with-Node.js-badge image. -->

<!-- SCREENSHOT: Nais APM Issues tab filtered to Browser-sourced exceptions, with the issue drawer showing a deobfuscated frontend stack trace. Replaces the stale "Logs tab / Include browser telemetry" image. -->

{% if tenant() == "nav" %}
For a full tour of the tabs, see [Get started with Nais APM](../apm/tutorials/get-started.md); for capturing errors from your own code, see [Track frontend errors with `@nais/apm`](../apm/tutorials/track-frontend-errors.md).
{% endif %}

For deeper analysis, use the [Explore view](https://grafana.<<tenant()>>.cloud.nais.io/explore) with one of the Loki data sources. Here are some useful queries:

```logql
# All frontend logs for your app
{app_name="my-app"} | logfmt

# Exceptions only
{app_name="my-app", kind="exception"} | logfmt

# Slow Largest Contentful Paint (> 2.5s)
{app_name="my-app", kind="measurement"} | logfmt | web_vitals_lcp > 2500
```

Traces are available from data sources ending with `-tempo`. Use [TraceQL](../tracing/reference/traceql.md) to query them.

## Local development

For local development, check out the [tracing demo repository](https://github.com/nais/tracing-demo) and run `docker-compose up`. This gives you a local Grafana, Loki, and Tempo stack to test against. See the README in that repository for details.

## Guides

| Guide | Description |
| ----- | ----------- |
| [Set up Faro](how-to/setup-faro.md) | Install, configure, and deploy Faro in any frontend app |
| [Next.js App Router](how-to/setup-nextjs.md) | Faro integration for Next.js with App Router |
| [Custom metrics](how-to/custom-metrics.md) | Send custom measurements and query them in Grafana |
| [Trace propagation](how-to/trace-propagation.md) | Connect frontend traces to backend spans |
| [Sourcemaps](how-to/sourcemaps.md) | How stack trace deobfuscation works |
| [Auto-configuration](reference/auto-configuration.md) | Generated config values and environment variables |
| [Troubleshooting](reference/troubleshooting.md) | CSP, CORS, and common issues |

## Further reading

{% if tenant() == "nav" %}
- [Nais APM](../apm/README.md) — view and triage the telemetry you instrument here
- [`@nais/apm` API reference](../apm/reference/apm-client-api.md) — the recommended SDK's full API
{% endif %}
- [Grafana Faro Web SDK docs](https://grafana.com/docs/grafana-cloud/monitor-applications/frontend-observability/)
- [Grafana Faro Web SDK on npm](https://www.npmjs.com/package/@grafana/faro-web-sdk)
- [Grafana Faro Web SDK changelog](https://github.com/grafana/faro-web-sdk/blob/main/CHANGELOG.md)
- [Grafana Faro Next.js example](https://github.com/grafana/faro-nextjs-example)

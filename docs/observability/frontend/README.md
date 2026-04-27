---
description: >-
  Frontend observability with Grafana Faro gives you real user monitoring,
  performance metrics, error tracking, and tracing for browser applications.
tags: [explanation, observability, frontend, services]
---

# Frontend observability

Nais provides frontend observability through the [Grafana Faro Web SDK][faro-web-sdk]. Faro runs in the browser and sends telemetry data (metrics, logs, errors, traces) to a collector on the Nais platform.

[faro-web-sdk]: https://www.npmjs.com/package/@grafana/faro-web-sdk

With 95+ applications already using Faro, it's the standard way to monitor frontend applications on Nais.

## What you get

- **[Core Web Vitals](https://web.dev/vitals/)** — TTFB, FCP, CLS, LCP, INP (collected automatically)
- **Logging** — `console.info`, `console.warn`, and `console.error` messages
- **Exceptions** — stack traces with [automatic sourcemap deobfuscation](how-to/sourcemaps.md)
- **Custom events and metrics** — anything you want to track
- **[Tracing](how-to/trace-propagation.md)** — OpenTelemetry-based browser traces, optionally connected to backend spans

## Get started

[:dart: Set up Faro in your application](how-to/setup-faro.md)

[:simple-nextdotjs: Set up Faro with Next.js App Router](how-to/setup-nextjs.md)

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

Use the [web vitals dashboard](https://grafana.<<tenant()>>.cloud.nais.io/d/k8g_nks4z/frontend-web-vitals) for a quick overview of your application's performance.

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
| [Trace propagation](how-to/trace-propagation.md) | Connect frontend traces to backend spans |
| [Sourcemaps](how-to/sourcemaps.md) | How stack trace deobfuscation works |
| [Troubleshooting](reference/troubleshooting.md) | CSP, CORS, and common issues |

## Further reading

- [Grafana Faro Web SDK docs](https://grafana.com/docs/grafana-cloud/frontend-observability/)
- [Grafana Faro Web SDK on npm](https://www.npmjs.com/package/@grafana/faro-web-sdk)
- [Grafana Faro Next.js example](https://github.com/grafana/faro-nextjs-example)

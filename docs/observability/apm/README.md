---
description: >-
  Nais APM is the curated application performance monitoring app in Grafana. It
  turns the telemetry your app already ships into service health, issues, and
  traces — no manual queries.
tags: [explanation, observability, apm, services]
---

# Nais APM

Nais APM is an app in your team's Grafana that gives every Nais service a single
home for application performance monitoring: a health overview, an issues list
across frontend *and* backend errors, endpoint and database analytics, traces,
and logs — built on the telemetry your apps already send to the platform.

You don't set anything up to get the basics. If your service produces traces,
metrics, or logs on Nais, it already shows up in Nais APM.

This is the **Legend** release of Nais APM.

[:dart: Open Nais APM](<<tenant_url("grafana", "a/nais-apm-app/services")>>)

<!-- SCREENSHOT: Service overview page — health header with RED big numbers, front and center -->

## What you get

- **Health overview** — the RED signals (rate, errors, duration) as big numbers
  with a delta against the previous period, so "is this OK right now?" is one
  glance. Deploy markers show which release changed the picture.
- **Issues** — one list of errors across the browser and the backend, grouped
  into stable issues you can resolve, ignore, and assign.
- **Endpoints, Database, Runtime** — RED metrics per endpoint, database query
  analytics and connection-pool health, and JVM/runtime internals.
- **Frontend** — Core Web Vitals, page performance, and browser-side errors for
  apps using [Grafana Faro](../frontend/README.md) or [`@nais/apm`](reference/apm-client-api.md).
- **Traces and Logs** — search and drill in, with log patterns and trace
  breakdowns to find what explains an incident.
- **A shared time picker** — one time range across every tab, carried in the URL
  so links you share open on the same window.

## Get started

1. [:dart: Get started with Nais APM](tutorials/get-started.md) — find your
   service and tour its health, issues, and traces.
2. [:dart: Track frontend errors with `@nais/apm`](tutorials/track-frontend-errors.md)
   — add the SDK to a browser app and see errors as issues.

## Guides

| Guide | Description |
| ----- | ----------- |
| [Triage an issue](how-to/triage-an-issue.md) | Resolve, ignore, assign, and understand regressions |
| [Create alerts from templates](how-to/create-alerts.md) | Error-rate, exception-spike, web-vitals, and new-exception alerts |
| [Enable session replay](how-to/enable-session-replay.md) | Opt in to masked screen recording for your app |
| [Collect user feedback](how-to/collect-user-feedback.md) | Capture free-text feedback with `captureFeedback` |
| [Make database queries visible](how-to/database-queries.md) | The instrumentation the Database tab needs |
| [Use log patterns during an incident](how-to/log-patterns.md) | Group noisy logs into a handful of patterns |

## Reference

| Page | Description |
| ---- | ----------- |
| [`@nais/apm` API](reference/apm-client-api.md) | Every export, signature, and option |
| [Issues and fingerprinting](reference/issues-model.md) | What makes two errors "the same issue" |
| [URL and deep-link contract](reference/url-contract.md) | Stable links for alerts, runbooks, and shared investigations |

## Understand it

[:bulb: How Nais APM works](explanations/how-nais-apm-works.md) — the LGTM
pipeline behind the app, why issue grouping is computed at query time, and what
Nais APM deliberately does *not* do.

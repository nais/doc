---
title: Getting Started with Observability in Nais
tags: [tutorial, observability, getting-started]
---

# Getting Started with Observability in Nais

This tutorial walks you through enabling observability for your Nais application and finding your data in the Grafana stack.

## Prerequisites

- A Nais application deployed to a cluster
- Access to your team's Grafana instance

## 1. Enable auto-instrumentation

Add auto-instrumentation to your `nais.yaml` and deploy:

```yaml
spec:
  observability:
    autoInstrumentation:
      enabled: true
      runtime: java  # or: nodejs, python, sdk
```

Nais injects the OpenTelemetry agent at startup. No code changes needed.

[:dart: Full auto-instrumentation guide](../how-to/auto-instrumentation.md)

## 2. Find your app in APM

Open the [Nais APM service inventory](<<tenant_url("grafana", "a/nais-apm-app")>>). Your application should appear within a few minutes of receiving traffic. The APM shows:

- **RED dashboards** — request rate, error rate, and latency
- **Operations breakdown** — which endpoints are slowest
- **Dependencies** — downstream services, databases, and message brokers
- **Runtime metrics** — JVM heap, Go goroutines, Node.js event loop

## 3. Explore metrics

Metrics are scraped automatically from your application's `/metrics` endpoint and stored in Mimir.

- Open [Grafana Explore](<<tenant_url("grafana", "explore")>>) and select a Mimir/Prometheus data source
- Query your metrics with PromQL, e.g. `http_server_request_duration_seconds_bucket{service_name="my-app"}`
- Create dashboards or use the [default Nais app dashboard](<<tenant_url("grafana", "d/000000283/nais-app-dashbord")>>)

## 4. Explore logs

Logs sent to `stdout`/`stderr` are collected automatically by Loki.

- In [Grafana Explore](<<tenant_url("grafana", "explore")>>), select a Loki data source
- Query: `{app="my-app"} | logfmt`
- For private logs, configure [Team Logs](../logging/how-to/team-logs.md)

## 5. Explore traces

Traces collected by the OpenTelemetry agent are stored in Tempo.

- In the APM, click any operation to jump to matching traces
- Or use [Grafana Explore](<<tenant_url("grafana", "explore")>>) with a Tempo data source to run TraceQL queries
- Correlate traces with logs for full request context

## Next steps

- [Add custom spans and metrics](opentelemetry-instrumentation.md) for business-specific tracing
- [Create custom metrics](../metrics/how-to/expose.md)
- [Set up alerting](../alerting/README.md)

---
description: Enable auto-instrumentation to collect traces and runtime metrics from your application without code changes.
tags: [how-to, tracing, observability]
---

# Get started with auto-instrumentation

Auto-instrumentation injects an [OpenTelemetry](https://opentelemetry.io/) agent into your application at startup.
The agent hooks into popular libraries and frameworks to collect [traces](../tracing/README.md) and runtime metrics — without code changes. Log export via OpenTelemetry is [available as an opt-in](../reference/auto-config.md#logs-auto-instrumentation).

Supported runtimes: **Java/Kotlin**, **Node.js**, **Python**, and **SDK-only** mode for Go and other languages that provide their own OpenTelemetry setup.

## What you get

Once enabled, the agent automatically instruments:

| Category | Examples (vary by runtime) |
|----------|----------|
| HTTP servers | Spring MVC, Ktor, Express, Flask, Koa |
| HTTP clients | OkHttp, Apache HttpClient, `node-fetch`, `requests` |
| Databases | PostgreSQL (JDBC, node-postgres), Valkey/Redis |
| Messaging | Kafka producers/consumers |
| gRPC | Client and server calls |
| Frameworks | Spring Boot, Ktor, Micrometer bridge |

This data powers the [Nais APM](<<tenant_url("grafana", "a/nais-apm-app")>>) dashboards — service inventory, RED metrics (Rate/Errors/Duration), dependency maps, and runtime metrics — with no extra configuration.

## Enable auto-instrumentation

Add the following to your `nais.yaml` and deploy:

=== "Java / Kotlin"

    ```yaml
    spec:
      observability:
        autoInstrumentation:
          enabled: true
          runtime: java
    ```

=== "Node.js"

    ```yaml
    spec:
      observability:
        autoInstrumentation:
          enabled: true
          runtime: nodejs
    ```

=== "Python"

    ```yaml
    spec:
      observability:
        autoInstrumentation:
          enabled: true
          runtime: python
    ```

=== "SDK only (Go, etc.)"

    This sets up the OpenTelemetry environment variables but does **not** inject an agent.
    Use this when your application configures the OpenTelemetry SDK itself.

    ```yaml
    spec:
      observability:
        autoInstrumentation:
          enabled: true
          runtime: sdk
    ```

## Verify it works

After deploying, check that traces are flowing:

1. Open the [Nais APM service inventory](<<tenant_url("grafana", "a/nais-apm-app")>>)
2. Find your application in the list — it should appear within a few minutes
3. Click through to see RED dashboards, operations breakdown, and dependencies

If your app does not appear, check the [auto-instrumentation configuration reference](../reference/auto-config.md) for troubleshooting environment variables, and make sure your application is receiving traffic.

You can also verify in [Grafana Explore](<<tenant_url("grafana", "explore")>>) using the Tempo data source:

```
{resource.service.name="<your-app-name>"}
```

## Next steps

- [Add custom spans and metrics](../tutorials/opentelemetry-instrumentation.md) for business-specific tracing
- [Explore traces in Grafana Tempo](../tracing/how-to/tempo.md)
- [:books: Auto-instrumentation configuration reference](../reference/auto-config.md)

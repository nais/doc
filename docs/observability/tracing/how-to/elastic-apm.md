---
description: This guide will help you get started with sending tracing data to Elastic APM.
tags: [how-to, opentelemetry, deprecated]
conditional: [tenant, nav]
---
# Tracing data in Elastic APM

!!! danger "Deprecated — will be removed"

    Elastic APM support in Nais is deprecated and will be removed. Use [auto-instrumentation](../../how-to/auto-instrumentation.md) with the Grafana stack (Tempo + Mimir + Loki) and [Nais APM](<<tenant_url("grafana", "a/nais-apm-app")>>) instead.

For nais applications running on-prem (dev-fss and prod-fss) you have the option to send telemetry data to Elastic APM in adition to Grafana. This guide will help you get started with Elastic APM for your application.

## Enable auto-instrumentation for Elastic APM

Elastic APM can be enabled by setting the list of auto-instrumentation destinations in your nais application manifest.

```yaml hl_lines="7-8"
spec:
  observability:
    autoInstrumentation:
      enabled: true
      runtime: "java"
      destinations:
        - id: "elastic-apm"
```

It is possible to send data to multiple destinations (such as `grafana-lgtm`) by adding more destinations to the list.

### Service Environment

If you have multiple virtual environments for your application such as `q1`, `t2`, or `p`, you can specify the environment in the `OTEL_RESOURCE_ATTRIBUTES` environment variable.

```yaml
spec:
  env:
    - name: OTEL_RESOURCE_ATTRIBUTES
      value: "deployment.environment.name=q1"
```

## Accessing the Elastic APM UI

The Elastic APM UI is available on the legacy logging system (not available in nav-logs) and requires you to log in with your NAV account and by selecting the `APM` menu item.

From there you can select the application (or service as they are called in Elastic APM) you want to inspect.

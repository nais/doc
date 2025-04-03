---
description: Get started with auto-instrumentation for your applications with OpenTelemetry data for Tracing, Metrics and Logs using the OpenTelemetry Agent.
tags: [how-to, tracing, observability]
---

# Get started with auto-instrumentation

This guide will explain how to get started with auto-instrumentation your applications with OpenTelemetry data for [Tracing](../tracing/README.md), [Metrics](../metrics/README.md) and [Logs](../logging/README.md) using the OpenTelemetry Agent.

The main benefit of auto-instrumentation is that is requires little to no effort on the part of the team developing the application while providing insight into popular libraries, frameworks and external services such as PostgreSQL, Valkey, Kafka and HTTP clients.

Auto-instrumentation is a preferred way to get started with tracing in Nais, and can also be used for metrics and logs collection.This type of instrumentation is available for Java, Node.js and Python applications, but can also be used for other in `sdk` mode where it will only set up the OpenTelemetry configuration.

## Enable auto-instrumentation for Java/Kotlin applications

```yaml
...
spec:
  observability:
    autoInstrumentation:
      enabled: true
      runtime: java
```

## Enable auto-instrumentation for Node.js applications

```yaml
...
spec:
  observability:
    autoInstrumentation:
      enabled: true
      runtime: nodejs
```

## Enable auto-instrumentation for Python applications

```yaml
...
spec:
  observability:
    autoInstrumentation:
      enabled: true
      runtime: python
```

## Enable auto-instrumentation for other applications

If your application runtime is not one of the supported runtimes or you want to instrument your application yourself you can stil get benefit from the auto instrumentation configuration.

This will only set up the OpenTelemetry configuration for the application, but it will not inject the OpenTelemetry Agent into the application.

```yaml
...
spec:
  observability:
    autoInstrumentation:
      enabled: true
      runtime: sdk
```

## Enable auto-instrumentation to multiple destinations

By default data is sent to Grafana, but it is possible to send data to multiple destinations by adding more destinations to the list depending on what cluster your application is running in.

```yaml hl_lines="8-9"
...
spec:
  observability:
    autoInstrumentation:
      enabled: true
      runtime: java
      destinations:
        - id: "grafana-lgtm"
        - id: "elastic-apm"
```

!!! info
    `elastic-apm` is only available for applications running on-prem (`dev-fss` and `prod-fss`).

## Resources

[:books: OpenTelemetry Auto-Instrumentation Configuration Reference](../reference/auto-config.md)

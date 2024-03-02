---
description: Get started with auto-instrumentation
tags: [guide, tracing]
---
# Get started with auto-instrumentation

This guide will explain how to get started with auto-instrumentation your applications with OpenTelemetry data for Tracing, Metrics and Logs using the OpenTelemetry Agent.

The main benefit of auto-instrumentation is that is requires little to no effort on the part of the team developing the application. The main challenge it that it offers few ways of

Auto-instrumentation

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
      runtime: node
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

If your application runtime is not one of the supported runtimes or you want to instrument your application yourself you can still get benefit from the auto instrumentation configuration.

This will only set up the OpenTelemetry configuration for the application, but it will not inject the OpenTelemetry Agent into the application.

```yaml
...
spec:
  observability:
    autoInstrumentation:
      enabled: true
      runtime: sdk
```

---
description: How to enable tracing in your application
tags: [guide, otel]
---
# Enable trace collection

This guide will show you how to get started collecting distributed trace data from your application.

## 1. Enable tracing in application manifest

The first step in collecting trace information is to enable it in your application spec:

???+ note ".nais/app.yaml"

    ```yaml
    ...
    spec:
      observability:
        tracing:
          enabled: true
    ...
    ```

## 2. Select an OTLP exporter

Select the appropriate [OTLP exporter](https://opentelemetry.io/ecosystem/registry/?s=otlp+exporter) for your specific application.
Ready-made libraries can be found for Java, Rust, Python, Go, and most other popular languages.

## 3. Configure the OTLP exporter

Finally, the OTLP exporter must be configured to send data to the NAIS collector.

That configuration is provided by NAIS through the `$OTEL_EXPORTER_OTLP_ENDPOINT` environment variable,
which in turn is supposed to be automatically detected and used by your OpenTelemetry library.
All data must be sent using the gRPC protocol.

You can find all the environment variables provided by NAIS in the [OpenTelemetry Tracing Reference](../../../reference/observability/otel/tracing.md).

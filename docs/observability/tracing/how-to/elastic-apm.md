---
description: This guide will help you get started with sending tracing data to Elastic APM.
tags: [how-to, opentelemetry, kibana]
conditional: [tenant, nav]
---
# Tracing data in Elastic APM

For nais applications running on-prem (dev-fss and prod-fss) you have the option to send telemetry data to Elastic APM in adition to Grafana. This guide will help you get started with Elastic APM for your application.

## Enable auto-instrumentation for Elastic APM

Elastic APM can be enabled by setting the list of auto-instrumentation destinations in your nais application manifest.

???+ note ".nais/application.yaml"
    ```yaml hl_lines="6"
    …
    spec:
      observability:
        autoInstrumentation:
          enabled: true
          runtime: "java"
          destinations:
            - id: "elastic-apm"
    ```

It is possible to send data to multiple destinations (such as `grafana-lgtm`) by adding more destinations to the list.

## Accessing the Elastic APM UI

The Elastic APM UI is available at [logs.adeo.no](https://logs.adeo.no/app/apm/services) and requires you to log in with your NAV account and by selecting the `APM` menu item.

From there you can select the application (or service as they are called in Elastic APM) you want to inspect.

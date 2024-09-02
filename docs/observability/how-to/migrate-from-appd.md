---
description: This guide will help you migrate from AppDynamics to OpenTelemetry for tracing data.
tags: [how-to, opentelemetry, tracing]
conditional: [tenant, nav]
---

# Migrate from AppDynamics to OpenTelemetry

We are deprecating AppDynamics in favor of OpenTelemetry and by the end of 2024 all applications must be migrated to OpenTelemetry for observability. This guide will help you migrate from AppDynamics to [OpenTelemetry AutoInstrumentation](./auto-instrumentation.md).

## Dockerfile

To migrate from AppDynamics to OpenTelemetry, you need to remove the AppDynamics agent from your Dockerfile and add the OpenTelemetry AutoInstrumentation agent.

Since we will be using the AutoInstrumentation feature of NAIS, you do not need to add any additional agents in your Dockerfile. The OpenTelemetry agent will be injected into your application automatically.

Here is an example removing the `-appdynamics` tag from the base image:

```diff
--- a/Dockerfile
+++ b/Dockerfile
@@ -1,5 +1,5 @@
-FROM ghcr.io/navikt/baseimages/temurin:21-appdynamics
+FROM ghcr.io/navikt/baseimages/temurin:21
```

AppDynamics specific enviorment variables should also be removed from the Dockerfile.

```diff
--- a/Dockerfile
+++ b/Dockerfile
@@ -1,5 +1,5 @@
-ENV APPDYNAMICS=/apikey/appdynamics/prod
-ENV APPD_ENABLED=true
-ENV APPD_NAME=my-application
```

## nais.yaml

To enable OpenTelemetry AutoInstrumentation in your application, you need to add the following configuration to your `nais.yaml` file:

```yaml
spec:
  observability:
    autoInstrumentation:
      enabled: true
      runtime: java
```

If you prefer using Elastic APM instead of Grafana you can set the `destinations` configuration:

```yaml hl_lines="6-7"
spec:
  observability:
    autoInstrumentation:
      enabled: true
      runtime: java
      destinations:
        - id: elastic-apm
```

You can remove any references to AppDymamics in the `.spec.env` and `.spec.vault` sections of your `nais.yaml` file.

## Resources

* [:dart: Get started with Grafana Tempo](../tracing/how-to/tempo.md)
* [:dart: Get started with Elastic APM](../tracing/how-to/elastic-apm.md)
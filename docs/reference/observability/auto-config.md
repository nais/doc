# OpenTelemetry Auto-Instrumentation Configuration

When you enable [auto-instrumentation](../../how-to-guides/observability/auto-instrumentation.md) in your application the following OpenTelemetry configuration will become available to your application as environment variables:

| Variable                             | Example Value                                                                                 |
| ------------------------------------ | --------------------------------------------------------------------------------------------- |
| `OTEL_SERVICE_NAME`                  | `my-application`                                                                              |
| `OTEL_EXPORTER_OTLP_ENDPOINT`        | `http://opentelemetry-collector.nais-system:4317`                                             |
| `OTEL_EXPORTER_OTLP_PROTOCOL`        | `grpc`                                                                                        |
| `OTEL_EXPORTER_OTLP_INSECURE`        | `true`                                                                                        |
| `OTEL_PROPAGATORS`                   | `tracecontext,baggage`                                                                        |
| `OTEL_TRACES_SAMPLER`                | `parentbased_always_on`                                                                       |
| `OTEL_RESOURCE_ATTRIBUTES_POD_NAME`  | `my-application-777787df6d-pw9mq`                                                             |
| `OTEL_RESOURCE_ATTRIBUTES_NODE_NAME` | `gke-node-abc123`                                                                             |
| `OTEL_RESOURCE_ATTRIBUTES`           | `service.name=my-application,service.namespace=my-team,k8s.container.name=my-application,...` |

!!! tip
    Do not hardcode these values in your application. OpenTelemetry SDKs and auto-instrumentation libraries will automatically pick up these environment variables and use them to configure the SDK.

## More OpenTelemetry Configuration

A full list of environment variables that can be used to configure the OpenTelemetry SDK can be found here:

* [:simple-opentelemetry: General SDK Configuration](https://opentelemetry.io/docs/specs/otel/configuration/sdk-environment-variables/#general-sdk-configuration)
* [:simple-opentelemetry: OTLP Exporter Configuration](https://opentelemetry.io/docs/languages/sdk-configuration/otlp-exporter/)

[OTLP is the OpenTelemetry Protocol](https://opentelemetry.io/docs/specs/otel/protocol/exporter/), and is the protocol used to send telemetry data to Prometheus, Grafana Tempo, and Grafana Loki.

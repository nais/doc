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

## Java Specific Configurations

When using the OpenTelemetry Java SDK and Agent (auto-instrumentation), the following additional environment variables are available:

| Variable                         | Description                                                                                       | Example Value                      |
| -------------------------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------- |
| `OTEL_JAVAAGENT_EXCLUDE_CLASSES` | Suppresses all instrumentation for specific classes, format is "my.package.MyClass,my.package2.*" | `my.package.MyClass,my.package2.*` |

* [:octicons-link-external-24: Advanced Java configuration options](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/docs/advanced-configuration-options.md)


## More OpenTelemetry Configuration

A full list of environment variables that can be used to configure the OpenTelemetry SDK can be found here:

* [:octicons-link-external-24: General SDK Configuration](https://opentelemetry.io/docs/specs/otel/configuration/sdk-environment-variables/#general-sdk-configuration)
* [:octicons-link-external-24: OTLP Exporter Configuration](https://opentelemetry.io/docs/languages/sdk-configuration/otlp-exporter/)

[OTLP is the OpenTelemetry Protocol](https://opentelemetry.io/docs/specs/otel/protocol/exporter/), and is the protocol used to send telemetry data to Prometheus, Grafana Tempo, and Grafana Loki.

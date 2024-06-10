---
tags: [observability, reference]
---

# OpenTelemetry Auto-Instrumentation Configuration

When you enable [auto-instrumentation](../how-to/auto-instrumentation.md) in your application the following OpenTelemetry configuration will become available to your application as environment variables:

| Variable                             | Example Value                                                                                 |
| ------------------------------------ | --------------------------------------------------------------------------------------------- |
| `OTEL_SERVICE_NAME`                  | `my-application`                                                                              |
| `OTEL_EXPORTER_OTLP_ENDPOINT`        | `http://opentelemetry-collector.nais-system:4317`                                             |
| `OTEL_EXPORTER_OTLP_PROTOCOL`        | `grpc`                                                                                        |
| `OTEL_EXPORTER_OTLP_INSECURE`        | `true`                                                                                        |
| `OTEL_PROPAGATORS`                   | `tracecontext,baggage`                                                                        |
| `OTEL_TRACES_SAMPLER`                | `parentbased_always_on`                                                                       |
| `OTEL_LOGS_EXPORTER`                 | `none`                                                                                        |
| `OTEL_RESOURCE_ATTRIBUTES_POD_NAME`  | `my-application-777787df6d-pw9mq`                                                             |
| `OTEL_RESOURCE_ATTRIBUTES_NODE_NAME` | `gke-node-abc123`                                                                             |
| `OTEL_RESOURCE_ATTRIBUTES`           | `service.name=my-application,service.namespace=my-team,k8s.container.name=my-application,...` |

!!! tip
    Do not hardcode these values in your application. OpenTelemetry SDKs and auto-instrumentation libraries will automatically pick up these environment variables and use them to configure the SDK.

## Agent Logs

You can enable logging for the OpenTelemetry Auto-Instrumentation by setting the `OTEL_LOGS_EXPORTER` environment variable to `otlp`. This will intercept all logs produced by the application and send them to the OpenTelemetry Collector.

```shell
spec:
  env:
    - name: OTEL_LOGS_EXPORTER
      value: otlp
```

!!! warning
    Enabling logging for the OpenTelemetry Auto-Instrumentation will send all logs to the OpenTelemetry Collector including logs from other libraries and frameworks such as log4j, logback, and slf4j. This should not be enabled if you are using Secure Logs.

## Agent Versions

The OpenTelemetry Agent is used to automatically instrument your application. The agent is responsible for collecting telemetry data and sending it to the OpenTelemetry Collector.

| Language | Agent Version | SDK Version |
| -------- | ------------- | ----------- |
| Java     | 2.4.0         | 1.38.0      |
| Node.js  | 0.51.0        | 1.24.0      |
| Python   | 0.44b0        | 1.23.0      |

## Java Agent

The OpenTelemetry Java Agent is a Java agent that automatically instruments your Java application. The agent is responsible for collecting telemetry data and sending it to the OpenTelemetry Collector.

It is attached to your JVM automatically at startup using the [`JAVA_TOOL_OPTIONS`](https://docs.oracle.com/javase/8/docs/technotes/guides/troubleshoot/envvars002.html) environment variable.

### Supported libraries, frameworks, application servers, and JVMs

The OpenTelemetry Java Agent supports many popular libraries, frameworks, application servers, and JVMs. A full list of supported libraries and frameworks can be found on the open-telemetry/opentelemetry-java-instrumentation repository.

* [:octicons-link-external-24: OpenTelemetry Instrumentation for Java Supported Libraries and Frameworks](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/docs/supported-libraries.md)

### Advanced Configuration

When using the OpenTelemetry Java SDK and Agent (auto-instrumentation), the following additional environment variables are available:

| Variable                                                                | Description                                                                                       | Example Value                      |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------- |
| `OTEL_JAVAAGENT_EXCLUDE_CLASSES`                                        | Suppresses all instrumentation for specific classes, format is "my.package.MyClass,my.package2.*" | `my.package.MyClass,my.package2.*` |
| `OTEL_INSTRUMENTATION_SPRING_BOOT_ACTUATOR_AUTOCONFIGURE_ENABLED`       | Enables or disables the Spring Boot Actuator auto-configuration instrumentation                   | `false`                            |
| `OTEL_INSTRUMENTATION_MICROMETER_ENABLED`                               | Enables or disables the Micrometer instrumentation                                                | `false`                            |
| `OTEL_INSTRUMENTATION_COMMON_EXPERIMENTAL_CONTROLLER_TELEMETRY_ENABLED` | Enables or disables controller span instrumentation                                               | `false`                            |
| `OTEL_INSTRUMENTATION_COMMON_EXPERIMENTAL_VIEW_TELEMETRY_ENABLED`       | Enables or disables view span instrumentation                                                     | `false`                            |

* [:octicons-link-external-24: Advanced Java configuration options](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/docs/advanced-configuration-options.md)

## More OpenTelemetry Configuration

A full list of environment variables that can be used to configure the OpenTelemetry SDK can be found here:

* [:octicons-link-external-24: General SDK Configuration](https://opentelemetry.io/docs/specs/otel/configuration/sdk-environment-variables/#general-sdk-configuration)
* [:octicons-link-external-24: OTLP Exporter Configuration](https://opentelemetry.io/docs/languages/sdk-configuration/otlp-exporter/)

[OTLP is the OpenTelemetry Protocol](https://opentelemetry.io/docs/specs/otel/protocol/exporter/), and is the protocol used to send telemetry data to Prometheus, Grafana Tempo, and Grafana Loki.

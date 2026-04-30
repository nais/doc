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

    These variables are managed by Nais. Do not hardcode them in your application code. The OTel SDK picks them up automatically. You **can** add extra attributes via `OTEL_RESOURCE_ATTRIBUTES` in your nais.yaml — see [Extra resource attributes](#extra-resource-attributes) below.

## Extra resource attributes

OpenTelemetry Resource Attributes are key-value pairs that describe the application and its environment. These attributes are attached to all telemetry data produced by the application and must adhere to the [OpenTelemetry Semantic Conventions](https://opentelemetry.io/docs/specs/semconv/resource/).

### How `OTEL_RESOURCE_ATTRIBUTES` works on Nais

You can safely set `OTEL_RESOURCE_ATTRIBUTES` in your nais.yaml — Nais **merges** your attributes with the platform-managed ones. It does not overwrite them.

Nais manages these attributes and will ignore any attempt to override them:

| Attribute | Set by | Value |
|---|---|---|
| `service.name` | Nais (from app name) | `my-application` |
| `service.namespace` | Nais (from namespace) | `my-team` |
| `nais.backend` | Nais (from destinations) | `destination1;destination2` |

Any other key=value pairs you provide are appended to the final `OTEL_RESOURCE_ATTRIBUTES` value.

```yaml title="nais.yaml"
spec:
  env:
    - name: OTEL_RESOURCE_ATTRIBUTES
      value: "deployment.environment.name=prod"
```

The resulting env var in the pod will be:
```
service.name=my-app,service.namespace=my-team,nais.backend=...,deployment.environment.name=prod
```

### When to set extra attributes

| Attribute | When to use | Effect |
|---|---|---|
| `deployment.environment.name` | Apps deployed to multiple environments (dev/prod, q1/q2) | APM and Grafana can filter by environment. The collector also uses this to strip env suffixes (e.g. `-q1`) from service names. |

### Available attributes

| Attribute                                                                                                     | Type   | Description                                                                                              | Example Value | Stability      |
| ------------------------------------------------------------------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------- | ------------- | -------------- |
| [`deployment.environment.name`](https://opentelemetry.io/docs/specs/semconv/resource/deployment-environment/) | string | Name of the deployment environment (e.g. `q1`, `prod`, `dev`). | `q1`;  `prod`    | `experimental` |

## Sanitizing sensitive data

While the OpenTelemetry SDKs and agents do a best effort to not include any user data, we have added extra protection by redacting some patterns from trace span attributes. The following attributes are scrubbed for personal identification numbers (fødselsnummer):

* `url.path`
* `url.full`
* `url.original`
* `url.query`
* `http.url`
* `http.target`
* `http.route`
* `db.statement`
* `messaging.kafka.message.key`

We advise you to look over the data collected by your application and ensure that no sensitive data is being stored and contact the nais-team if you have any questions or concerns.

## Logs auto-instrumentation

You can enable instrumenting logs using the OpenTelemetry Auto-Instrumentation by setting the `OTEL_LOGS_EXPORTER` environment variable to `otlp`. This will intercept all logs produced by the application and send them to the OpenTelemetry Collector.

```shell
spec:
  env:
    - name: OTEL_LOGS_EXPORTER
      value: otlp
```

!!! warning
    Enabling logging for the OpenTelemetry Auto-Instrumentation will send all logs to the OpenTelemetry Collector including logs from other libraries and frameworks such as log4j, logback, and slf4j. This should not be enabled if you are using Team Logs.

## Agent Versions

The OpenTelemetry Agent is used to automatically instrument your application. The agent is responsible for collecting telemetry data and sending it to the OpenTelemetry Collector.

| Runtime  | Agent Version          | SDK Version  |
| -------- | ---------------------- | ------------ |
| `java`   | [2.22.0][java-agent]   | 1.55.0       |
| `nodejs` | [0.67.0][nodejs-agent] | 0.208.0      |
| `python` | [0.51b0][python-agent] | 1.30.0       |
| `dotnet` | 1.12.0                 |              |

[java-agent]: https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/tag/v2.22.0
[nodejs-agent]: https://github.com/open-telemetry/opentelemetry-js-contrib/releases/tag/auto-instrumentations-node-v0.67.0
[python-agent]: https://github.com/open-telemetry/opentelemetry-python-contrib/releases/tag/v0.51b0
[dotnet-agent]: https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation/releases/tag/v1.12.0

## Java Agent

The Java agent attaches to your JVM automatically at startup using the [`JAVA_TOOL_OPTIONS`](https://docs.oracle.com/javase/8/docs/technotes/guides/troubleshoot/envvars002.html) environment variable.

### Supported libraries, frameworks, application servers, and JVMs

The OpenTelemetry Java Agent supports many popular libraries, frameworks, application servers, and JVMs. A full list of supported libraries and frameworks can be found on the open-telemetry/opentelemetry-java-instrumentation repository.

* [:octicons-link-external-24: OpenTelemetry Instrumentation for Java Supported Libraries and Frameworks](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/docs/supported-libraries.md)

### Advanced Configuration

When using the OpenTelemetry Java SDK and Agent (auto-instrumentation), the following additional environment variables are available:

| Variable                                                                | Description                                                                                           | Example Value                      |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------- |
| `OTEL_JAVAAGENT_LOGGING`                                                | Controls log output from the Java Agent itself, valid values are `none`, `simple`, and `application`  | `simple`                           |
| `OTEL_JAVAAGENT_EXCLUDE_CLASSES`                                        | Suppresses all instrumentation for specific classes, format is "my.package.MyClass,my.package2.*"     | `my.package.MyClass,my.package2.*` |
| `OTEL_INSTRUMENTATION_SPRING_BOOT_ACTUATOR_AUTOCONFIGURE_ENABLED`       | Enables or disables the Spring Boot Actuator auto-configuration instrumentation                       | `false`                            |
| `OTEL_INSTRUMENTATION_MICROMETER_ENABLED`                               | Enables or disables the Micrometer instrumentation                                                    | `false`                            |
| `OTEL_INSTRUMENTATION_COMMON_EXPERIMENTAL_CONTROLLER_TELEMETRY_ENABLED` | Enables or disables controller span instrumentation                                                   | `false`                            |
| `OTEL_INSTRUMENTATION_COMMON_EXPERIMENTAL_VIEW_TELEMETRY_ENABLED`       | Enables or disables view span instrumentation                                                         | `false`                            |

* [:octicons-link-external-24: Advanced Java configuration options](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/docs/advanced-configuration-options.md)
* [:octicons-link-external-24: Java agent logging output](https://opentelemetry.io/docs/zero-code/java/agent/configuration/#java-agent-logging-output)

## More OpenTelemetry Configuration

A full list of environment variables that can be used to configure the OpenTelemetry SDK can be found here:

* [:octicons-link-external-24: General SDK Configuration](https://opentelemetry.io/docs/specs/otel/configuration/sdk-environment-variables/#general-sdk-configuration)
* [:octicons-link-external-24: OTLP Exporter Configuration](https://opentelemetry.io/docs/languages/sdk-configuration/otlp-exporter/)

[OTLP is the OpenTelemetry Protocol](https://opentelemetry.io/docs/specs/otel/protocol/exporter/), used to send telemetry data from your application to the OpenTelemetry Collector, which forwards it to backends like Tempo, Loki, and Mimir.

## Destinations

If you need to override where telemetry data is stored, you can do so with the following configuration in your `nais.yaml`:

```yaml
spec:
  observability:
    autoInstrumentation:
      destinations:
        - id: grafana-lgtm
```

The following destinations are available:

* `grafana-lgtm`

Default destination for each environment can be found in the [environments overview](../../workloads/reference/environments.md).

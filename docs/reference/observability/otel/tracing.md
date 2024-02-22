---
description: OpenTelemetry Tracing reference documentation
tags: [reference, otel]
---
# OpenTelemetry Tracing Reference

## Environment variables

The following environment variables are available for configuring the tracing library:

| Name                          | Description                                                                       | Default value                                             |
| ----------------------------- | --------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | The endpoint to send trace data to.                                               | `http://opentelemetry-collector.nais-system:4317`         |
| `OTEL_EXPORTER_OTLP_INSECURE` | Whether to use an insecure connection when sending trace data.                    | `true`                                                    |
| `OTEL_EXPORTER_PROTOCOL`      | The protocol to use when sending trace data. Must be `grpc`.                      | `grpc`                                                    |
| `OTEL_RESOURCE_ATTRIBUTES`    | A comma-separated list of key-value pairs to be added to the resource attributes. | `service.name=$APP_NAME,service.namespace=$APP_NAMESPACE` |
| `OTEL_SERVICE_NAME`           | The name of the service.                                                          | `$APP_NAME`                                               |

## Instrumentation libraries

The following libraries are available for instrumenting your application:

| Language | Library                                                                                           |
| -------- | ------------------------------------------------------------------------------------------------- |
| Java     | [OpenTelemetry Java](https://opentelemetry.io/docs/instrumentation/java/getting-started/)         |
| Node.js  | [OpenTelemetry Node.js](https://opentelemetry.io/docs/instrumentation/js/getting-started/nodejs/) |
| Python   | [OpenTelemetry Python](https://opentelemetry.io/docs/python/getting-started/)                     |
| Go       | [OpenTelemetry Go](https://opentelemetry.io/docs/go/getting-started/)                             |

You can also see the [nais/examples](https://github.com/nais/examples) repository for examples of how to instrument your application.

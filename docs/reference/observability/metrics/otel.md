# OpenTelemetry Metrics

This is a list of metrics exported by the OpenTelemetry SDKs and auto-instrumentation libraries.

## General Metrics

The OpenTelemetry SDKs and auto-instrumentation libraries export the following general metrics:

| Metric Name   | Description                                                                                            |
| ------------- | ------------------------------------------------------------------------------------------------------ |
| `target_info` | Information about the target service, such as the service name, service namespace, and container name. |

Target information is exported as a set of labels, including:

| Label Name                | Description                                      | Example Value                                                 |
| ------------------------- | ------------------------------------------------ | ------------------------------------------------------------- |
| `os_description`          | The operating system description.                | `Linux 6.1.58+`                                               |
| `os_type`                 | The operating system type.                       | `Linux`                                                       |
| `process_command_args`    | The command arguments used to start the process. | `["/usr/lib/jvm/java-21-openjdk/bin/java","-jar","/app.jar"]` |
| `process_runtime_name`    | The runtime name.                                | `OpenJDK Runtime Environment`                                 |
| `process_runtime_version` | The runtime version.                             | `21.0.2+13-LTS`                                               |
| `telemetry_sdk_language`  | The telemetry SDK language.                      | `java`                                                        |
| `telemetry_sdk_version`   | The telemetry SDK version.                       | `1.36.0`                                                      |

## HTTP Server Metrics

The OpenTelemetry SDKs and auto-instrumentation libraries export the following metrics for HTTP servers:

| Metric Name                                | Description                                            |
| ------------------------------------------ | ------------------------------------------------------ |
| `http_server_duration_milliseconds_bucket` | Duration of HTTP server requests, in milliseconds.     |
| `http_server_duration_milliseconds_count`  | Count of HTTP server requests, by duration.            |
| `http_server_duration_milliseconds_sum`    | Sum of HTTP server request durations, in milliseconds. |

## Database Client Connection Metrics

The OpenTelemetry SDKs and auto-instrumentation libraries export the following metrics for database clients:

| Metric Name                                             | Description                                                            |
| ------------------------------------------------------- | ---------------------------------------------------------------------- |
| `db_client_connections_create_time_milliseconds_bucket` | Duration of database client connection creation, in milliseconds.      |
| `db_client_connections_create_time_milliseconds_count`  | Count of database client connection creations, by duration.            |
| `db_client_connections_create_time_milliseconds_sum`    | Sum of database client connection creation durations, in milliseconds. |

## JVM Metrics

The OpenTelemetry SDKs and auto-instrumentation libraries export the following metrics for JVMs:

| Metric Name                              | Description                          |
| ---------------------------------------- | ------------------------------------ |
| `process_runtime_jvm_buffer_count`       | Count of JVM buffers.                |
| `process_runtime_jvm_buffer_limit_bytes` | Limit of JVM buffer sizes, in bytes. |
| `process_runtime_jvm_buffer_usage_bytes` | Usage of JVM buffer sizes, in bytes. |

## Kafka Metrics

The OpenTelemetry SDKs and auto-instrumentation libraries export the following metrics for Kafka clients:

| Metric Name        | Description                  |
| ------------------ | ---------------------------- |
| `kafka_producer_*` | Metrics for Kafka producers. |
| `kafka_consumer_*` | Metrics for Kafka consumers. |

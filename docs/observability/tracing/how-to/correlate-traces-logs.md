---
description: Learn how to correlate traces with logs in Grafana Tempo.
tags: [how-to, tracing, observability]
---
# Correlate traces and logs

This guide will explain how to correlate traces with logs in Grafana Tempo by including trace information in your logs. This will allow you to easily see the logs that are associated with a trace and troubleshoot issues in your application.

## Configure Tracing

First you need to configure OpenTelemetry tracing in your application. The easiest way to get started with tracing is to enable auto-instrumentation for your application. This will automatically collect traces and send them to the correct place using the OpenTelemetry Agent or you can use the OpenTelemetry SDK to manually instrument your application.

[:dart: Get started with auto-instrumentation](../../how-to/auto-instrumentation.md)

## Enable logging to Grafana Loki

In order to use the Grafana Tempo log correlation feature, you need to send your logs to Grafana Loki.

[:dart: Enable logging to Grafana Loki](../../logging/how-to/loki.md#enable-logging-to-grafana-loki)

## Include trace information in your logs

The final step is to include trace information in your logs. This will allow Grafana Tempo to look up logs that are associated with a trace.

=== "logback"

    Add the [opentelemetry-logback-mdc-1.0](https://mvnrepository.com/artifact/io.opentelemetry.instrumentation/opentelemetry-logback-mdc-1.0) package to your `pom.xml` or `build.gradle` to include trace information in your logs:

    ```
    io.opentelemetry.instrumentation:opentelemetry-logback-mdc-1.0:2.16.0-alpha
    ```

    Add the following pattern to your logback configuration to include trace information in your logs:

    ```xml
    <?xml version="1.0" encoding="UTF-8" ?>
    <configuration>
        <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
            <encoder class="net.logstash.logback.encoder.LogstashEncoder" />
        </appender>

        <appender name="OTEL" class="io.opentelemetry.instrumentation.logback.mdc.v1_0.OpenTelemetryAppender">
            <appender-ref ref="STDOUT" />
        </appender>

        <root level="INFO">
            <appender-ref ref="OTEL" />
        </root>
    </configuration>
    ```

=== "log4j"

    Add the [opentelemetry-javaagent-log4j-context-data-2.17](https://mvnrepository.com/artifact/io.opentelemetry.javaagent.instrumentation/opentelemetry-javaagent-log4j-context-data-2.17) package to your `pom.xml` or `build.gradle` to include trace information in your logs:

    ```
    io.opentelemetry.instrumentation:opentelemetry-log4j-context-data-2.17-autoconfigure:2.16.0-alpha
    ```

    Add the following pattern to your log4j configuration to include trace information in your logs:

    ```xml
        <?xml version="1.0" encoding="UTF-8"?>
        <Configuration status="WARN">
            <Appenders>
                <Console name="Console" target="SYSTEM_OUT">
                    <PatternLayout pattern="%d{HH:mm:ss.SSS} [%t] %-5level %logger{36} traceId: %X{trace_id} spanId: %X{span_id} - %msg%n" />
                </Console>
            </Appenders>
            <Loggers>
                <Root level="INFO">
                    <AppenderRef ref="Console"/>
                </Root>
            </Loggers>
        </Configuration>
    ```

=== "@navikt/pino-logger"

    If you are using [Pino](https://github.com/pinojs/pino) or `@navikt/pino-logger`, correlation is enabled by default when you use the OpenTelemetry Node.js auto-instrumentation. The trace and span IDs will be included in the logs automatically.

    If you are using Next.js be sure to add the `@navikt/pino-logger` and `pino` packages to `serverExternalPackages` in your `next.config.js` file to prevent it from being tree-shaken by Next.js:

    ```javascript
    // next.config.js
    module.exports = {
      serverExternalPackages: ['@navikt/pino-logger', 'pino'],
    };
    ```

=== "@navikt/next-logger"

    If you are using the [@navikt/next-logger](https://github.com/navikt/next-logger), correlation is enabled by default when you use the OpenTelemetry Node.js auto-instrumentation. The trace and span IDs will be included in the logs automatically.

    Be sure to add the `@navikt/next-logger` and `pino` packages to `serverExternalPackages` in your `next.config.js` file to prevent it from being tree-shaken by Next.js:

    ```javascript
    // next.config.js
    module.exports = {
      serverExternalPackages: ['@navikt/next-logger', 'pino'],
    };
    ```

## Profit

Now that you have tracing and logging set up, you can use Grafana Tempo to correlate traces and logs. When you view a trace in Grafana Tempo, you can see the logs that are associated with that trace. This makes it easy to understand what happened in your application and troubleshoot issues.

![Correlate traces and logs](../../../assets/grafana-tempo-logs.png)

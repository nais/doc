---
tags: [how-to, logging]
conditional: [tenant, nav]
---
# Enable secure logs

This guide will show you how to enable shipping of secure logs for your application.

## Prerequisites

If your NAIS team has already at any point produced secure logs, you can skip this step.

If your team has never before produced secure logs, before enabling them for the first time, give a warning in [#kibana](https://nav-it.slack.com/archives/C7T8QHXD3) Slack channel. There are some things that need to be adjusted before a new team can start sending. Remember to include the name of your NAIS team in the message.

## Configuring secure logs

To enable secure logs for your application, you need to add the following configuration to your application manifest. This will send all logs produced by the application to the secure logs index in Kibana.

???+ note ".nais/app.yaml"

    ```yaml
    spec:
        observability:
            logging:
                destinations:
                - id: secure_logs
    ```

## Legacy secure logs configuration

!!! warning "Deprecated syntax"

    This part of the guide contains the now deprecated syntax for enabling secure logs and is subject to removal in the future.

### Enabling secure logs [manifest](../../../workloads/application/reference/application-spec.md)

???+ note ".nais/app.yaml"

    ```yaml hl_lines="2-3"
    spec:
        secureLogs:
            enabled: true
    ```

### Set log rotation

With secure logs enabled a directory `/secure-logs/` will be mounted in the application container. Every `*.log` file in this directory will be monitored and the content transferred to Elasticsearch. Make sure that these files are readable for the log shipper \(the process runs as uid/gid 1065\).

!!! warning "directory size limit"

    The `/secure-logs/` directory has a size limit of 128Mb, and it's the application's responsibility to ensure that this limit is not exceeded.

    **If the limit is exceeded the application pod will be evicted and restarted.**

#### Example log configuration

Log files should be in JSON format as the normal application logs. Here is an example configuration of JSON logging with a size based rolling file appender in Logback:

```xml
  <appender name="secureLog" class="ch.qos.logback.core.rolling.RollingFileAppender">
    <file>/secure-logs/secure.log</file>
    <rollingPolicy class="ch.qos.logback.core.rolling.FixedWindowRollingPolicy">
      <fileNamePattern>/secure-logs/secure.log.%i</fileNamePattern>
      <minIndex>1</minIndex>
      <maxIndex>1</maxIndex>
    </rollingPolicy>
    <triggeringPolicy class="ch.qos.logback.core.rolling.SizeBasedTriggeringPolicy">
      <maxFileSize>50MB</maxFileSize>
    </triggeringPolicy>
    <encoder class="net.logstash.logback.encoder.LogstashEncoder" />
  </appender>
```

### Configure log shipping

Example configuration selecting which logs go to secure logs

???+ note "logback.xml"

    ```xml
    <configuration>
        <appender name="appLog" class="ch.qos.logback.core.ConsoleAppender">
            <encoder class="net.logstash.logback.encoder.LogstashEncoder"/>
            <filter class="ch.qos.logback.core.filter.EvaluatorFilter">
                <evaluator class="ch.qos.logback.classic.boolex.OnMarkerEvaluator">
                    <marker>SECURE_LOG</marker>
                </evaluator>
                <OnMismatch>NEUTRAL</OnMismatch>
                <OnMatch>DENY</OnMatch>
            </filter>
        </appender>

        <appender name="secureLog" class="ch.qos.logback.core.rolling.RollingFileAppender">
            <file>/secure-logs/secure.log</file>
            <rollingPolicy class="ch.qos.logback.core.rolling.FixedWindowRollingPolicy">
                <fileNamePattern>/secure-logs/secure.log.%i</fileNamePattern>
                <minIndex>1</minIndex>
                <maxIndex>1</maxIndex>
            </rollingPolicy>
            <triggeringPolicy class="ch.qos.logback.core.rolling.SizeBasedTriggeringPolicy">
                <maxFileSize>128MB</maxFileSize>
            </triggeringPolicy>
            <encoder class="net.logstash.logback.encoder.LogstashEncoder"/>
            <filter class="ch.qos.logback.core.filter.EvaluatorFilter">
                <evaluator class="ch.qos.logback.classic.boolex.OnMarkerEvaluator">
                    <marker>SECURE_LOG</marker>
                </evaluator>
                <OnMismatch>DENY</OnMismatch>
                <OnMatch>NEUTRAL</OnMatch>
            </filter>
        </appender>

        <root level="INFO">
            <appender-ref ref="appLog"/>
            <appender-ref ref="secureLog"/>
        </root>
    </configuration>
    ```

### Use secure logs in application

Using the Logback config below you can log to secure logs by writing Kotlin-code like this:

```kotlin
import org.slf4j.Logger
import org.slf4j.Marker
import org.slf4j.MarkerFactory
...
val log: Logger = ...
val SECURE: Marker= MarkerFactory.getMarker("SECURE_LOG")
...
log.info(SECURE, "Sensitive data here") // Logging to secure logs
log.info("Non-sensitive data here") // Logging to non-secure app logs
```

See doc on [Logback filters](https://logback.qos.ch/manual/filters.html#evaluatorFilter) and [markers](https://www.slf4j.org/api/org/slf4j/MarkerFactory.html)
See [Example log configuration](#example-log-configuration) for further configuration examples.

#### Non-JSON logs

If the logging framework used doesn't support JSON logging, it is also possible to use multiline logs in this format:

```text
<iso8601 timestamp> <log level> <message>
<message cont.>
<message cont.>
```

Files on this format must be named `*.mlog`.

#### Sending logs with HTTP

If you do not want to have these logs as files in the pod, it is also possible to use HTTP to write logs. POST your log entry as JSON to `http://localhost:19880`

```bash
curl -X POST -d '{"log":"hello world","field1":"value1"}' -H 'Content-Type: application/json' http://localhost:19880/
```

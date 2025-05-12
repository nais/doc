---
description: Get started with Team Logs, a private logging solution leveraging Google Cloud Logs.
tags: [how-to, logging, observability, team-logs]
---

# Get started with Team Logs

Team Logs is a private logging solution leveraging Google Cloud Logs. It provides your team with a secure, isolated log storage system, ensuring logs are not mixed with those of other teams.

## How to Configure Team Logs

To send logs to your team's private index, configure your application to use the `team-logs` appender. This configuration is typically done in your `logback.xml` or `log4j.xml`.

=== "Logback"

    ```xml
    <configuration>
      <appender name="team-logs" class="net.logstash.logback.appender.LogstashTcpSocketAppender">
        <destination>team-logs.nais-system:5170</destination>
        <encoder class="net.logstash.logback.encoder.LogstashEncoder">
          <customFields>{"google_cloud_project":"${GOOGLE_CLOUD_PROJECT}","nais_namespace_name":"${NAIS_NAMESPACE}","nais_pod_name":"${HOSTNAME}","nais_container_name":"${NAIS_APP_NAME}"}</customFields>
          <includeContext>false</includeContext>
        </encoder>
        <filter class="ch.qos.logback.core.filter.EvaluatorFilter">
          <evaluator class="ch.qos.logback.classic.boolex.OnMarkerEvaluator">
            <marker>TEAM_LOGS</marker>
          </evaluator>
          <OnMatch>ACCEPT</OnMatch>
          <OnMismatch>DENY</OnMismatch>
        </filter>
      </appender>

      <appender name="default-json" class="ch.qos.logback.core.ConsoleAppender">
        <encoder class="net.logstash.logback.encoder.LogstashEncoder" />
      </appender>

      <root level="INFO">
        <appender-ref ref="default-json" />
        <appender-ref ref="team-logs" />
      </root>

      <logger name="team-logs-logger" level="INFO" additivity="false">
        <appender-ref ref="team-logs" />
      </logger>
    </configuration>
    ```

    You also need to add the following dependency to your `pom.xml`:

    ```xml
    <dependency>
      <groupId>net.logstash.logback</groupId>
      <artifactId>logstash-logback-encoder</artifactId>
      <version>8.1</version>
    </dependency>
    ```

=== "Log4j2"

    ```xml
    <Configuration>
      <Appenders>
        <Console name="default-json" target="SYSTEM_OUT">
          <JsonLayout compact="true" />
        </Console>

        <Socket name="team-logs" host="team-logs.nais-system" port="5170" protocol="tcp">
          <JsonLayout compact="true">
            <KeyValuePair key="google_cloud_project" value="${env:GOOGLE_CLOUD_PROJECT}"/>
            <KeyValuePair key="nais_namespace_name" value="${env:NAIS_NAMESPACE}"/>
            <KeyValuePair key="nais_pod_name" value="${env:HOSTNAME}"/>
            <KeyValuePair key="nais_container_name" value="${env:NAIS_APP_NAME}"/>
          </JsonLayout>
          <Filters>
            <MarkerFilter marker="TEAM_LOGS" onMatch="ACCEPT" onMismatch="DENY" />
          </Filters>
        </Socket>
      </Appenders>

      <Loggers>
        <Logger name="team-logs-logger" level="info" additivity="false">
          <AppenderRef ref="team-logs"/>
        </Logger>

        <Root level="info">
          <AppenderRef ref="default-json"/>
          <AppenderRef ref="team-logs"/>
        </Root>
      </Loggers>
    </Configuration>
    ```

The referenced environment variables are set automatically in your application, so you don't need to configure them manually.The referenced environment variables are set automatically in your application, you do not need to set them manually.

This configuration ensures that all logs are sent exclusively to your team's private log index on Google Cloud.

### Nais.yaml Configuration

You also need to configure your `nais.yaml` file to allow the application to send logs to the `team-logs` appender. This is done by adding the following configuration:

```yaml
...
accessPolicy:
  outbound:
    rules:
      - application: logging
        namespace: nais-system
```

### Other Logging Libraries

You can use other logging libraries that support JSON format and TCP/HTTP output.

* TCP: `team-logs.nais-system:5170`
* HTTP: `team-logs.nais-system:9880`

The format for the logs should be JSON, and you must include the following fields:

| Field Name           | Description                       | Environment Variable |
| -------------------- | --------------------------------- | -------------------- |
| google_cloud_project | The Google Cloud project ID       | GOOGLE_CLOUD_PROJECT |
| nais_namespace_name  | The namespace of the application  | NAIS_NAMESPACE       |
| nais_pod_name        | The name of the pod               | HOSTNAME             |
| nais_container_name  | The name of the container         | NAIS_APP_NAME        |
| message              | The log message                   |                      |
| severity             | The log level (e.g., INFO, ERROR) |                      |

{% if tenant() == "nav" %}
## Migrating from Secure Logs

If you are migrating from Secure Logs to Team Logs, you need to ensure that your application is configured to send logs to the `team-logs` appender instead of the Secure Logs appender. This involves updating your logging configuration files (`logback.xml` or `log4j2.xml`) and ensuring that the necessary dependencies are included in your project.

You should also remove any references to Secure Logs in your `nais.yaml` configuration - specifically the `secureLogs` section.
{% endif %}

## Writing Logs

To ensure that your logs are sent to the `team-logs` appender, you can use SLF4J markers or loggers. Below are detailed examples of how to do this in both Logback and Log4j2.

=== "Logback"

    If you are using Logback, you can use the `team-logs` appender in your logging configuration. You can also use SLF4J markers to route specific log messages to the `team-logs` appender.

    Below is an example in Kotlin using an SLF4J marker to ensure your log messages are routed to the "team-logs" appender:

    ```kotlin
    import org.slf4j.LoggerFactory
    import org.slf4j.MarkerFactory

    class MyClass {
      private val logger = LoggerFactory.getLogger(MyClass::class.java)
      // Create a marker that your Logback configuration recognizes for "team-logs"
      private val teamLogsMarker = MarkerFactory.getMarker("TEAM_LOGS")

      fun logMessages() {
        // Log to the default JSON appender
        logger.info("This log goes to the default JSON appender")

        // Log to the team-logs appender using the TEAM_LOGS marker
        logger.info(teamLogsMarker, "This log goes to the team-logs appender")

        // Log an error to the team-logs appender
        logger.error(teamLogsMarker, "This is an error message for team-logs")
      }
    }
    ```

    Ensure that your `logback.xml` configuration includes the `team-logs` appender and the marker-based filter as shown in the configuration section above.

=== "Log4j2"

    If you are using Log4j2, you can use the `team-logs` appender in your logging configuration. You can also use markers to route specific log messages to the `team-logs` appender.

    Below is an example in Kotlin using a Log4j2 marker to ensure your log messages are routed to the "team-logs" appender:

    ```kotlin
    import org.apache.logging.log4j.LogManager
    import org.apache.logging.log4j.MarkerManager

    class MyClass {
      private val logger = LogManager.getLogger(MyClass::class.java)
      private val teamLogsMarker = MarkerManager.getMarker("TEAM_LOGS")

      fun logMessages() {
        // Log to the default JSON appender
        logger.info("This log goes to the default JSON appender")

        // Log to the team-logs appender using the TEAM_LOGS marker
        logger.info(teamLogsMarker, "This log goes to the team-logs appender")

        // Log an error to the team-logs appender
        logger.error(teamLogsMarker, "This is an error message for team-logs")
      }
    }
    ```

    Ensure that your `log4j2.xml` configuration includes the `team-logs` appender and the marker-based filter as shown in the configuration section above.

=== "curl"

    If you are using a logging library that does not support SLF4J or Log4j2, you can still send logs to the `team-logs` appender using a simple HTTP request. Below is an example using `curl`:

    ```bash
    curl -X POST \
      -H "Content-Type: application/json" \
      -d '{
        "google_cloud_project": "my-project",
        "nais_namespace_name": "my-namespace",
        "nais_pod_name": "my-pod",
        "nais_container_name": "my-container",
        "message": "This is a log message for team-logs",
        "severity": "INFO"
      }' \
      http://team-logs.nais-system:9880
    ```

### Key Points for Developers

1. **Markers**: Use the `TEAM_LOGS` marker to route logs to the `team-logs` appender. Without this marker, logs will go to the default JSON appender.
2. **Error Handling**: Always log errors with appropriate severity levels (e.g., `error`, `warn`) to ensure they are easily identifiable.
3. **Structured Logging**: Use JSON format for logs to make them easier to query and analyze.
4. **Configuration**: Ensure your logging configuration files (`logback.xml` or `log4j2.xml`) are correctly set up with the `team-logs` appender and marker-based filters.

## Accessing Team Logs

Team Logs can be accessed through the [Google Cloud Console](https://console.cloud.google.com/logs/query) or other tools that support Google Cloud Logging. Note that Team Logs are kept separate from standard log destinations like Grafana Loki and thus aren’t available through its standard logging interface.

### Querying Team Logs

To search your logs, use the Google Cloud Logging Query Language. Here are some practical examples:

* Filter by app name:
  ```
  resource.labels.container_name="my-app"
  ```

* Filter by severity:
  ```
  severity>=ERROR
  ```

* Combine multiple filters:
  ```
  resource.labels.container_name="my-app" AND severity>=ERROR AND "database error"
  ```

* Filter by a specific time range:
  ```
  timestamp>="2023-10-01T00:00:00Z" AND timestamp<="2023-10-31T23:59:59Z"
  ```

For more detailed guidance, review the following resources:

* [Advanced Queries](https://cloud.google.com/logging/docs/view/advanced-queries)
* [Query Library](https://cloud.google.com/logging/docs/view/query-library)

### Log Labels

Team Logs automatically attaches labels to every log entry for better context. Below are some key labels you’ll see:

```json
{
  "resource": {
    "labels": {
      "cluster_name": "dev",
      "container_name": "my-app",
      "location": "gcp",
      "namespace_name": "my-team",
      "pod_name": "my-app-7789dbcdb4-12345",
      "extra_label": "my-label"
    },
    "type": "k8s_container"
  }
}
```

This structure ensures that you can easily locate and analyze your team's logs with clarity and precision.

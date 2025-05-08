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
          <customFields>{"google_cloud_project":"${GOOGLE_CLOUD_PROJECT}","nais_metadata":{"namespace_name":"${NAIS_NAMESPACE}","pod_name":"${HOSTNAME}","container_name":"${NAIS_APP_NAME}"}}</customFields>
          <includeContext>false</includeContext>
        </encoder>
      </appender>

      <root level="all">
      <appender-ref ref="team-logs"/>
      </root>
    </configuration>
    ```

=== "Log4j2"

    ```xml
    <Configuration>
      <Appenders>
        <Socket name="team-logs" host="team-logs.nais-system" port="5170" protocol="tcp">
          <JsonLayout complete="false" compact="true">
          <KeyValuePair key="google_cloud_project" value="${env:GOOGLE_CLOUD_PROJECT}"/>
          <KeyValuePair key="nais_metadata.namespace_name" value="${env:NAIS_NAMESPACE}"/>
          <KeyValuePair key="nais_metadata.pod_name" value="${env:HOSTNAME}"/>
          <KeyValuePair key="nais_metadata.container_name" value="${env:NAIS_APP_NAME}"/>
          </JsonLayout>
        </Socket>
      </Appenders>
      <Loggers>
        <Root level="all">
          <AppenderRef ref="team-logs"/>
        </Root>
      </Loggers>
    </Configuration>
    ```

=== "nais.yaml"

    ```yaml
    ...
    accessPolicy:
      outbound:
        rules:
          - application: logging
            namespace: nais-system
    ```

!!! info

    The referenced environment variables are set automatically in your application, so you don't need to configure them manually.The referenced environment variables are set automatically in your application, you do not need to set them manually.

This configuration ensures that all logs are sent exclusively to your team's private log index on Google Cloud.

### Other Logging Libraries

You can use other logging libraries that support JSON format and TCP/HTTP output.

* TCP: `team-logs.nais-system:5170`
* HTTP: `team-logs.nais-system:9880`

The format for the logs should be JSON, and you must include the following fields:

| Field Name                   | Description                       | Environment Variable |
| ---------------------------- | --------------------------------- | -------------------- |
| google_cloud_project         | The Google Cloud project ID       | GOOGLE_CLOUD_PROJECT |
| nais_metadata.namespace_name | The namespace of the application  | NAIS_NAMESPACE       |
| nais_metadata.pod_name       | The name of the pod               | HOSTNAME             |
| nais_metadata.container_name | The name of the container         | NAIS_APP_NAME        |
| message                      | The log message                   |                      |
| severity                     | The log level (e.g., INFO, ERROR) |                      |

All other fields will be available upon querying the logs. Please see the [Google Cloud Logging documentation](https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry) for more details on the log entry format.

## Accessing Team Logs

Team Logs can be accessed through the [Google Cloud Console](https://console.cloud.google.com/logs/query) or other compatible tools. Note that Team Logs remain separate from default log destinations like Grafana Loki and can not be accessed through the standard logging interface in Grafana.

### Querying Team Logs

Utilize the Cloud Logging query language to filter and analyze your logs. Here are some examples:

* Filter by resource type:

  ```
  resource.type="k8s_container"
  ```

- Filter by severity:

  ```
  severity>=ERROR
  ```

- Combine multiple filters:

  ```
  resource.type="k8s_container" AND severity>=ERROR AND "database error"
  ```

- Apply date and time filters:

  ```
  timestamp>="2023-10-01T00:00:00Z" AND timestamp<="2023-10-31T23:59:59Z"
  ```

  For more detailed information on crafting queries, see the [Google Cloud Logging documentation](https://cloud.google.com/logging/docs/view/logging-query-language). Additionally, you can refer to these resources:
  * [Advanced Queries](https://cloud.google.com/logging/docs/view/advanced-queries)
  * [Query Library](https://cloud.google.com/logging/docs/view/query-library)

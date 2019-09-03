# Secure logs

Some applications have logs with information that should not be stored
with the normal application logs. To support this a directory for
these logs can be mounted in the application, and the content of logs
written here will be transferred to separate indices in Elasticsearch.

## Enabling secure logs

Secure logs can be enabled by setting the `secureLogs.enabled` flag
in the application resource. See
[the nais manifest specification](/content/deploy/nais-manifest.md).

## Log files

With secure logs enabled a directory `/secure-logs/` will be mounted
in the application container. Every `*.log` file in this directory will be
monitored and the content transferred to Elasticsearch.

The `/secure-logs/` directory has a size limit of 128Mb, and it's the
application responsibility to ensure that this limit is not
exceeded. **If the limit is exceeded the application pod will be
evicted and restarted.** Use log rotation on file size to avoid this.

## Log configuration

Log files should be in JSON format as the normal application
logs. Here is an example configuration of JSON logging with a size
based rolling file appender in Logback:

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

See [logging examples](examples.md) for more information on log configuration.

## Non-JSON logs

If the logging framework used doesn't support JSON logging, it is also possible to use multiline logs in this format:

```
<iso8601 timestamp> <log level> <message>
<message cont.>
<message cont.>
```

Files on this format must be named `*.mlog`.

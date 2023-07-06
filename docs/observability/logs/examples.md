# Examples

## SLF4J

### pom.xml

```markup
<dependencies>
  <dependency>
    <groupId>ch.qos.logback</groupId>
    <artifactId>logback-classic</artifactId>
    <version>1.2.3</version>
  </dependency>
  <dependency>
    <groupId>net.logstash.logback</groupId>
    <artifactId>logstash-logback-encoder</artifactId>
    <version>5.1</version>
  </dependency>
  <dependency>
    <groupId>org.slf4j</groupId>
    <artifactId>slf4j-api</artifactId>
    <version>1.7.25</version>
  </dependency>
</dependencies>
```

### logback.xml

```markup
<configuration>
  <appender name="stdout_json" class="ch.qos.logback.core.ConsoleAppender">
    <encoder class="net.logstash.logback.encoder.LogstashEncoder" />
  </appender>
  <root level="info">
    <appender-ref ref="stdout_json" />
  </root>
</configuration>
```

### Issues with long log messages

The max log message size in Docker is 16KB, so if it will be split into parts if it's bigger. Fluentd dosen't support this, so we recommend making stack traces shorter. Read more about this on [github.com/logstash](https://github.com/logstash/logstash-logback-encoder#customizing-stack-traces).

```markup
<configuration>
   <appender name="stdout_json" class="ch.qos.logback.core.ConsoleAppender">
      <encoder class="net.logstash.logback.encoder.LogstashEncoder">
         <throwableConverter class="net.logstash.logback.stacktrace.ShortenedThrowableConverter">
            <maxDepthPerThrowable>30</maxDepthPerThrowable>
            <exclude>java\.util\.concurrent\..*</exclude>
            <exclude>org\.apache\.tomcat\..*</exclude>
            <exclude>org\.apache\.coyote\..*</exclude>
            <exclude>org\.apache\.catalina\..*</exclude>
            <exclude>org\.springframework\.web\..*</exclude>
         </throwableConverter>
      </encoder>
   </appender>
   <root level="info">
      <appender-ref ref="stdout_json"/>
   </root>
</configuration>
```

### Secure logs using Marker

Using the Logback config below you can log to secure logs by writing Kotlin-code like this:
```
import org.slf4j.Logger
import org.slf4j.Marker
import org.slf4j.MarkerFactory
...
val log: Logger = ...
val SECURE: Marker= MarkerFactory.getMarker("SECURE_LOG")
...
log.info(SECURE, "Sensitive data here")
```

logback.xml:
```
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

See doc on [Logback filters](https://logback.qos.ch/manual/filters.html#evaluatorFilter) and [markers](https://www.slf4j.org/api/org/slf4j/MarkerFactory.html)


## Log4j2

### pom.xml

```markup
<dependencies>
  <dependency>
    <groupId>org.apache.logging.log4j</groupId>
    <artifactId>log4j-api</artifactId>
    <version>2.17.2</version>
  </dependency>
  <dependency>
    <groupId>org.apache.logging.log4j</groupId>
    <artifactId>log4j-core</artifactId>
    <version>2.17.2</version>
  </dependency>
  <dependency>
    <groupId>org.apache.logging.log4j</groupId>
    <artifactId>log4j-layout-template-json</artifactId>
    <version>2.17.2</version>
  </dependency>
  <dependency>
    <groupId>org.apache.logging.log4j</groupId>
    <artifactId>log4j-slf4j-impl</artifactId>
    <version>2.17.2</version>
  </dependency>
  <dependency>
    <groupId>org.slf4j</groupId>
    <artifactId>slf4j-api</artifactId>
    <version>1.7.25</version>
  </dependency>
</dependencies>
```

### log4j2.xml

```markup
<?xml version="1.0" encoding="UTF-8"?>
<Configuration status="INFO">
    <Appenders>
        <Console name="ConsoleAppender" target="SYSTEM_OUT">
          <JsonTemplateLayout templateUri="classpath:LogstashJsonEventLayoutV1.json" stackTraceEnabled="true"/>
        </Console>
    </Appenders>
    <Loggers>
        <Root level="info">
            <AppenderRef ref="ConsoleAppender"/>
        </Root>
    </Loggers>
</Configuration>
```

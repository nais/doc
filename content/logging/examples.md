## Examples

### SLF4J

#### pom.xml

```xml
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

#### logback.xml

```xml
<configuration>
  <appender name="stdout_json" class="ch.qos.logback.core.ConsoleAppender">
    <encoder class="net.logstash.logback.encoder.LogstashEncoder" />
  </appender>
  <root level="info">
    <appender-ref ref="stdout_json" />
  </root>
</configuration>
```


#### Issues with long log messages

The max log message size in Docker is 16KB, so if it will be split into parts if it's bigger. Fluentd dosen't support this, so we recommend making stack traces shorter. Read more about this on [github.com/logstash](https://github.com/logstash/logstash-logback-encoder#customizing-stack-traces).

```xml
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

### Log4j2

### pom.xml

```xml
<dependencies>
  <dependency>
    <groupId>org.apache.logging.log4j</groupId>
    <artifactId>log4j-api</artifactId>
    <version>2.11.0</version>
  </dependency>
  <dependency>
    <groupId>org.apache.logging.log4j</groupId>
    <artifactId>log4j-core</artifactId>
    <version>2.11.0</version>
  </dependency>
  <dependency>
    <groupId>com.vlkan.log4j2</groupId>
    <artifactId>log4j2-logstash-layout-fatjar</artifactId>
    <version>0.11</version>
  </dependency>
  <dependency>
    <groupId>org.apache.logging.log4j</groupId>
    <artifactId>log4j-slf4j-impl</artifactId>
    <version>2.11.0</version>
  </dependency>
  <dependency>
    <groupId>org.slf4j</groupId>
    <artifactId>slf4j-api</artifactId>
    <version>1.7.25</version>
  </dependency>
</dependencies>
```

#### log4j2.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Configuration status="INFO" packages="com.vlkan.log4j2.logstash.layout">
    <Appenders>
        <Console name="ConsoleAppender" target="SYSTEM_OUT">
          <LogstashLayout dateTimeFormatPattern="yyyy-MM-dd'T'HH:mm:ss.SSSZZZ"
                          templateUri="classpath:LogstashJsonEventLayoutV1.json"
                          prettyPrintEnabled="false"
                          stackTraceEnabled="true"/>
        </Console>
    </Appenders>
    <Loggers>
        <Root level="info">
            <AppenderRef ref="ConsoleAppender"/>
        </Root>
    </Loggers>
</Configuration>
```

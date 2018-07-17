Logging
=======

Configure your application to log to console (stdout/stderr), it will be scraped by [FluentD](https://www.fluentd.org/) running inside the cluster and sent to [Elasticsearch](https://www.elastic.co/products/elasticsearch) and made available via [Kibana](). Visit our Kibana at [logs.adeo.no](https://logs.adeo.no/).

If you want more information than just the log message (logleve, MDC, etc), you should log in JSON format; the fields you provide will then be indexed.


## Maven dependencies

```pom.xml
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

![overview](/_media/logging.png)

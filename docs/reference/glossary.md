# A nais glossary

## Observability

Observability is a measure of how well internal states of a system can be inferred from knowledge of its external outputs. It is a measure of how well a system's internal states can be inferred from knowledge of its external outputs. In other words, observability is the ability to understand the internal state of a system by examining its outputs.

### Metrics

Metrics are a numerical measurement of something in your application. They are useful for understanding the performance of your application and is generally more scalable than logs both in terms of storage and querying since they are structured data.

### Prometheus

[Prometheus](https://prometheus.io/) is a time-series database that is used to store metrics. It is a very powerful tool that can be used to create alerts and dashboards. Prometheus is used by many open source projects and is the de facto standard for metrics in the cloud native world.

### Alertmanager

[Alertmanager](https://prometheus.io/docs/alerting/alertmanager/) is a component of Prometheus that is used to create and manage alerts. It can send alerts to various different channels like email, Slack, PagerDuty, etc.

### Grafana

[Grafana](https://grafana.com/) is a tool for creating dashboards and visualizing data. It is often used in combination with Prometheus to create dashboards and alerts.

### Traces

Traces are a record of the path a request takes through your application. They are useful for understanding how a request is processed in your application.

### Span

A span represents a single unit of work in a trace, like a SQL query or an HTTP call to an external service.

### Grafa Tempo

[Grafana Tempo](https://grafana.com/oss/tempo/) is an open-source, easy-to-use, high-scale, and cost-effective distributed tracing backend that stores and queries traces in a way that is easy to understand and use. It is fully integrated with Grafana, allowing you to visualize and query traces in the same interface as your metrics, and logs.

### OpenTelemetry

[OpenTelemetry](https://opentelemetry.io) is a set of APIs, libraries, agents, and instrumentation to provide observability for cloud-native software. It is a project under the Cloud Native Computing Foundation (CNCF) and is the merger of the OpenTracing and OpenCensus projects.

### Logs

Logs are a record of what has happened in your application. They are useful for debugging, but due to their unstructured format they generally do not scale very well.

### Kiibana

[Kibana](https://www.elastic.co/kibana) is a tool for visualizing logs. It is often used in combination with Elasticsearch to create dashboards and alerts.

### Elasticsearch

[Elasticsearch](https://www.elastic.co/elasticsearch/) is a search engine that is used to store logs. It is a very powerful tool that can be used to create alerts and dashboards. Elasticsearch is used by many open source projects and is the de facto standard for logs in the cloud native world.

### Grafana Loki

[Grafana Loki](https://grafana.com/oss/loki/) is a horizontally-scalable, highly-available, multi-tenant log aggregation system inspired by Prometheus. It is designed to be very cost-effective and easy to operate, as it does not index the contents of the logs, but rather a set of labels for each log stream.
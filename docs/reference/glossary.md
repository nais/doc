# A nais glossary

## Observability

Observability is the art of understanding how a system behaves by adding instrumentation such as logs, metrics, and traces.

### Metrics

Metrics are a numerical measurement of something in your application such as the number of requests or the response time. Metrics are much better suited for for dashboards and alerts compared to logs.

### Prometheus

[Prometheus](https://prometheus.io/) is a time-series database that is used to store and query metrics from Grafana.

### Alertmanager

[Alertmanager](https://prometheus.io/docs/alerting/alertmanager/) is a component of Prometheus that is used to create and manage Slack alerts based on the metrics collected by Prometheus.

### Grafana

[Grafana](https://grafana.com/) is a tool for creating application dashboards and visualizing data such as metrics, traces, and logs in a user-friendly way.

### Traces

Traces are a record of the path a request takes through your application. They are useful for understanding how a request is processed across multiple internal and external services.

### Span

A span represents a single unit of work in a Trace, like a SQL query or an HTTP call to an API.

### Context

Each Span carries a Context that includes metadata about the trace (like a unique trace identifier and span identifier) and any other data you choose to include. This context is propagated across process boundaries, allowing all the work that's part of a single trace to be linked together, even if it spans multiple services.

### Grafana Tempo

[Grafana Tempo](https://grafana.com/oss/tempo/) is a storage and query system for traces in Grafana.

### OpenTelemetry

[OpenTelemetry](https://opentelemetry.io) is the standard for instrumenting your application for observability. It provides APIs, libraries, agents, and instrumentation to capture distributed traces, metrics and logs from your application.

### Logs

Logs are a record of what has happened in your application. They are useful for debugging, but due to their unstructured format they generally do not scale very well. Use metrics for dashboards and alerts and traces for understanding how a request is processed across multiple services.

### Grafana Loki

[Grafana Loki](https://grafana.com/oss/loki/) is a storage and query system for logs in Grafana.

### Kibana

[Kibana](https://www.elastic.co/kibana) is a tool for visualizing logs. It is often used in combination with Elasticsearch to create dashboards and alerts.

### Elasticsearch

[Elasticsearch](https://www.elastic.co/elasticsearch/) is a search engine that is used to store logs.

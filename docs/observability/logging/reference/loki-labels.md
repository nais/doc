---
description: Loki label reference documentation for querying logs in Grafana Loki.
tags: [reference, loki, logging]
---

# Loki Labels Reference

In Grafana Loki, each log stream is identified by a small set of **indexed labels**. Additional context is attached to individual log lines as **structured metadata**. Both can be used to filter logs in LogQL queries, but only indexed labels belong inside the stream selector `{…}`.

## Indexed labels

Indexed labels form the stream selector and are the only labels you should place inside the curly braces `{…}` of a LogQL query. In Nais, only the following labels are indexed:

| Label               | Description                                                    | Applicable to |
| ------------------- | ------------------------------------------------------------- | ------------- |
| `service_name`      | The name of the application that generated the log line.      | All           |
| `service_namespace` | The namespace of the application that generated the log line. | All           |
| `k8s_cluster_name`  | The name of the Kubernetes cluster that generated the log line. | Kubernetes  |

Example stream selector using indexed labels only:

```logql
{service_name="my-app", service_namespace="my-team", k8s_cluster_name="prod-gcp"}
```

## Structured metadata

Everything else is attached to each log line as structured metadata rather than being indexed. Structured metadata is fully filterable, but it **must not** be placed inside the stream selector `{…}`. Instead, filter on it later in the pipeline with a label-filter expression:

```logql
{service_name="my-app"} | detected_level="error"
```

| Field                | Description                                                               | Applicable to |
| -------------------- | ------------------------------------------------------------------------- | ------------- |
| `detected_level`     | The log level detected by the log parser.                                 | All           |
| `k8s_container_name` | The name of the Kubernetes container that generated the log line.         | Kubernetes    |
| `k8s_pod_name`       | The name of the Kubernetes pod that generated the log line.               | Kubernetes    |
| `k8s_node_name`      | The name of the Kubernetes node that generated the log line.              | Kubernetes    |
| `collector_name`     | The name of the log collector that ingested the log line.                 | All           |
| `kind`               | The kind of log line. Can be `exception`, `event`, `log` or `measurement`. | Faro SDK      |

---
description: Loki label reference documentation for querying logs in Grafana Loki.
tags: [reference, loki, logging]
---

# Loki Labels Reference

In Grafana Loki, logs are stored as key-value pairs called labels. Labels are used to filter, aggregate, and search for logs and can be used in LogQL queries to search for logs by message, by field, or by a combination of both.

The following labels are available in Grafana Loki by default:

| Field                | Description                                                               | Applicable to |
| -------------------- | ------------------------------------------------------------------------- | ------------- |
| `service_name`       | The name of the application that generated the log line.                  | All           |
| `service_namespace`  | The namespace of the application that generated the log line.             | All           |
| `k8s_container_name` | The name of the Kubernetes container that generated the log line.         | Kubernetes    |
| `k8s_pod_name`       | The name of the Kubernetes pod that generated the log line.               | Kubernetes    |
| `k8s_node_name`      | The name of the Kubernetes node that generated the log line.              | Kubernetes    |
| `k8s_cluster_name`   | The name of the Kubernetes cluster that generated the log line.           | Kubernetes    |
| `collector_name`     | The name of the log collector that ingested the log line.                 | All           |
| `kind`               | The kind of log line. Can be `exception`, `event` `log` or `measurement`, | Faro SDK      |

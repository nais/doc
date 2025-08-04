---
title: Loki Metrics Reference
description: Reference documentation for metrics derived from Loki logs
---

This reference document describes the metrics that are automatically derived from logs collected by Loki in the NAIS platform.

## `loki:service:loglevel:count1m`

This metric represents the count of logs aggregated over a 1-minute window, categorized by service and log level.

### Description

The `loki:service:loglevel:count1m` metric provides a pre-aggregated count of log entries for each 1-minute interval, grouped by service, namespace, cluster, and log level. This metric is particularly useful for:

- Monitoring the volume of logs at different severity levels
- Setting up alerts for unusual increases in error or warning logs
- Creating dashboards to visualize logging patterns across services
- Identifying services with excessive logging

### Labels

| Label               | Description                                                    | Example Values                            |
| ------------------- | -------------------------------------------------------------- | ----------------------------------------- |
| `service_name`      | The name of the service or application that generated the logs | `my-app`, `user-api`                      |
| `service_namespace` | The Kubernetes namespace where the service is running          | `team-a`, `default`                       |
| `k8s_cluster_name`  | The name of the Kubernetes cluster                             | `dev-gcp`, `prod-gcp`                     |
| `detected_level`    | The log level or severity of the log entries                   | `error`, `warn`, `info`, `debug`, `trace` |

### Usage Examples

#### Prometheus Query Examples

Count of error logs for a specific service in the last hour:

```promql
sum(loki:service:loglevel:count1m{service_name="my-app", service_namespace="my-team", detected_level="error"}[60m:1m])
```

Ratio of errors to total logs for all services in a namespace:

```promql
sum(loki:service:loglevel:count1m{service_namespace="team-a", service_namespace="my-team", detected_level="error"}) /
sum(loki:service:loglevel:count1m{service_namespace="team-a", service_namespace="my-team"})
```

#### Alert Examples

Alert on high number of error logs:

```promql
sum(loki:service:loglevel:count1m{detected_level="error"}) > 100
```

### Best Practices

- Do not use `increase()` or `rate()` functions with this metric, as it is already pre-aggregated for 1-minute intervals
- For longer time ranges, use range vector selectors like `[60m:1m]` to sample at 1-minute intervals
- Consider setting appropriate thresholds for alerts based on your application's normal logging behavior
- Combine with other metrics (like HTTP status codes) for more comprehensive service health monitoring

### Related Documentation

- [Grafana Loki How-to Guides](../how-to/loki.md)

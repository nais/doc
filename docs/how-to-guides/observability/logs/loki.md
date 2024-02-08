---
description: Get started with Grafana Loki, a log aggregation system that is integrated with Grafana and inspired by Prometheus.
tags: [observability, logs]
---
# Get started with Grafana Loki

This guide will help you get started with Grafana Loki, a log aggregation system that is integrated with Grafana and inspired by Prometheus.

## Enable logging to Grafana Loki

Grafana Loki can be enabled by setting the list of logging destinations in your nais application manifest.

???+ note ".nais/application.yaml"
    ```yaml hl_lines="6"
    …
    spec:
      observability:
        logging:
          destinations:
            - id: loki
    ```

## Working with logs in Grafana Loki

Grafana Loki is integrated directly with Grafana, and you can access your logs either by adding a Logs Panel to your dashboard or by clicking on the "[Explore](<<tenant_url("grafana", "explore")>>)" link on the left-hand side of the Grafana UI and selecting one of the Loki data sources (one for each environment).

Grafana Loki has a query language called [LogQL](../../../reference/observability/logs/logql.md) that you can use to search for logs. LogQL is a simplified version of PromQL, and you can use LogQL to search for logs by message, by field, or by a combination of both.



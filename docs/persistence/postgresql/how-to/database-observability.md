---
title: Postgres database metrics
tags: [postgres, metrics, how-to]
---

!!! warning "Experimental feature"
    This feature is an alpha feature, and is subject to API change, instability or removal.
    See the [main Postgres page](../README.md) for more information.
    

All PostgreSQL databases running in the cluster export metrics using the [Prometheus postgres exporter](https://github.com/prometheus-community/postgres_exporter).

{#TODO: Add more information about the metrics collected, and how to use them#}

## Viewing Postgres metrics in your Grafana dashboard

To view Postgres metrics in your Grafana dashboard, you can use the normal cluster datasource.

1. Log on to [Grafana](<<tenant_url("grafana")>>).
2. In your Grafana dashboard, add a new panel.
6. Select the metric you want to display.
7. Add any filters you want to apply to the metric.

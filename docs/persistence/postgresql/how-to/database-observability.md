---
title: Postgres database metrics
tags: [postgres, metrics, how-to]
---

!!! warning "Experimental feature"
    This feature is an alpha feature, and is subject to API change, instability or removal.
    See the [main Postgres page](../README.md) for more information.
    

All PostgreSQL databases running in the cluster export metrics using the [Prometheus postgres exporter](https://github.com/prometheus-community/postgres_exporter).

## Viewing Postgres metrics in Grafana

To view Postgres metrics in your Grafana dashboard, you can use the normal cluster datasource.

1. Log on to [Grafana](<<tenant_url("grafana")>>d/zalando-postgres/zalando-postgres-operator-overview).
2. Select desired datasource (aka environment), namespace and instance.


## Viewing other Postgres metrics in Grafana

1. Log on to [Grafana](<<tenant_url("grafana")>>).
2. Go to Drilldown -> Metrics.
3. Select desired datasource (aka environment).
4. Add a label filter with `namespace=pg-<team-name>`.
5. Add a label filter with `cluster_name=<cluster-name>`.
6. Explore available metrics. Metrics from postgres-exporter usually start with `pg_`.
7. You can also create your own dashboards using these metrics.


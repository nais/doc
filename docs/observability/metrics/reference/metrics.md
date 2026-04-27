---
tags: [reference, metrics]
---

# Metrics reference

## Retention

The default metrics retention is 30 days.
If you need data stored longer than this, we recommend using [BigQuery](../../../persistence/bigquery/README.md).
Then you have full control of the database and retention.

## Querying metrics

Query metrics using the [Explore view in Grafana](<<tenant_url("grafana", "explore")>>). Pick the Mimir data source that matches your environment (e.g. `dev`, `prod`).

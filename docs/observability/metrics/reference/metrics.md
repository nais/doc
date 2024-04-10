---
tags: [reference, metrics, prometheus]
---

# Metrics reference

## Retention

When using Prometheus the retention is 30 days.
If you need data stored longer than what Prometheus support, we recommend using [BigQuery](../../../persistence/bigquery/README.md).
Then you have full control of the database and retention.

## Accessing prometheus

You can visit the prometheus instance for your environment by visiting the following URL:

```plaintext
    https://prometheus.<MY-ENV>.<<tenant()>>.cloud.nais.io
```

Replace `<MY-ENV>` with the environment you want to access, e.g. `dev`, `prod` etc.

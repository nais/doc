---
tags: [influxdb, how-to]
---

!!! info "Disclaimer"

    We discourage use of Aiven InfluxDB](README.md) for new use cases and don't support InfluxDB as software. [BigQuery](../../bigquery/README.md) might be a better fit for many use cases. Questions about Aiven and provisioning can be directed to #nais on Slack.

# 1. Get an InfluxDB instance 

We use a IaC-repo to provision InfluxDB instances. Head over to [aiven-iac](https://github.com/navikt/aiven-iac#influxdb) to learn how to get your own instance.

# 2. Retention policies
The default database is created with a default retention policy of 30 days. You might want to adjust this by e.g. creating a new default retention policy with 1 year retention:

```
create retention policy "365d" on "defaultdb" duration 365d replication 1 shard duration 1w default
```
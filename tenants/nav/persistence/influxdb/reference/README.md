---
title: InfluxDB reference
tags: [influxdb, reference]
---

# InfluxDB reference

## Retention policies
The default database is created with a default retention policy of 30 days. You might want to adjust this by e.g. creating a new default retention policy with 1 year retention:

```
create retention policy "365d" on "defaultdb" duration 365d replication 1 shard duration 1w default
```

## Datasource in Grafana

Let us know in [#nais](https://nav-it.slack.com/archives/C5KUST8N6) if you want your InfluxDB to be exposed in Grafana.
This means that everyone can access your data.

## Access from laptop

With Naisdevice you have access to the _aiven-prod_ gateway.
This is a JITA (just in time access) gateway, so you need to describe why, but the access is automatically given.

```
influx -username avnadmin -password foo -host influx-instancename-nav-dev.aivencloud.com -port 26482 -ssl
```

PS: Remember to use Influxdb CLI pre v2. For example v1.8.3.

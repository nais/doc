# Datasource in Grafana

Let us know in [#nais](https://nav-it.slack.com/archives/C5KUST8N6) if you want your InfluxDB to be exposed in Grafana.
This means that everyone can access your data.
(TODO: Nav ONLY)
# Access from laptop

With Naisdevice you have access to the _aiven-prod_ gateway.
This is a JITA (just in time access) gateway, so you need to describe why, but the access is automatically given.

```
influx -username avnadmin -password foo -host influx-instancename-nav-dev.aivencloud.com -port 26482 -ssl
```

PS: Remember to use Influxdb CLI pre v2. For example v1.8.3.
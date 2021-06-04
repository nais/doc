# Influxdb

The NAIS platform offers Influxdb via [Aiven](https://aiven.io/).

## Get your own
As there are very teams that need an Influxdb instance we use a IaC-repo to provision each instance.
Head over to [aiven-iac](https://github.com/navikt/aiven-iac#influxdb) to learn how to get your own instance.

### Username and password
For now we are manually distributing the username and password for each instance.
There is only one user for Influxdb.

### Default database name
The default database name is `defaultdb`.

### Retention policies

The default database is created with a default retention policy of 30 days. You might want to adjust this by e.g. creating a new default retention policy with 1 year retention:

```
create retention policy "365d" on "defaultdb" duration 365d replication 1 shard duration 1w default
```

## Datasource in grafana.adeo.no
Let us know in [#pig-aiven](https://nav-it.slack.com/archives/C018L1JATBQ) if you want your Influxdb to be exposed at grafana.adeo.no.
This means that everyone has access to your data.

## Access from Nais-app
If you need access from an application, you need to reuse the access given for Elastic Search instances.
See [nais.yaml-reference](../nais-application/application.md#elasticinstance).

### Access to CA-certificate
Your application also need a CA-certificate for accessing Aiven.
For now you can only get these when setting [`.spec.kafka.pool`](../nais-application/application.md#kafkapool).

## Access from laptop
With Naisdevice you have access to the _aiven-prod_ gateway.
This is a JITA (just in time access) gateway, so you need to describe why, but the access is automatically given.

## Support
We do not offer support on Influxdb as software, but questions about Aiven and provisioning can be directed to [#pig_aiven](https://nav-it.slack.com/archives/C018L1JATBQ) on Slack.

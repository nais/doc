# Influxdb

The NAIS platform offers Influxdb via [Aiven](https://aiven.io/). A typical use case is to store metrics from your app and visualize them in [Grafana](https://grafana.adeo.no/).

## Get your own instance
As there are many teams that need Influxdb we use an IaC-repo to provision each instance.
Head over to [aiven-iac](https://github.com/navikt/aiven-iac#influxdb).

### Username and password
For now we are manually distributing the username and password for each instance.
There is only one user for Influxdb. Contact us in [#pig-aiven](https://nav-it.slack.com/archives/C018L1JATBQ) to get your credentials.

### Default database name
The default database name is `defaultdb`.

### Retention policies
The default database is created with a default retention policy of 30 days. You might want to adjust this by e.g. creating a new default retention policy with 1 year retention:

```
create retention policy "365d" on "defaultdb" duration 365d replication 1 shard duration 1w default
```

## Datasource in grafana.adeo.no
Let us know in [#pig-aiven](https://nav-it.slack.com/archives/C018L1JATBQ) if you want your Influxdb to be exposed at grafana.adeo.no.
This means that everyone can access your data.

## Access from Nais-app
If you need access from an application, you need to reuse the access given for Elastic Search instances.
See [nais.yaml-reference](../nais-application/application.md#elasticinstance).

### Loading CA-certificate
Your application will also need an CA-certificate for your app to be able to connect to Aiven with SSL. The certificate will be loaded into to your pod as an environment variable if you define a [`.spec.kafka.pool`](../nais-application/application.md#kafkapool) in your nais.yaml file.

## Access from laptop
With Naisdevice you have access to the _aiven-prod_ gateway.
This is a JITA (just in time access) gateway, so you need to describe why, but the access is automatically given.

```
influx -username avnadmin -password foo -host influx-instancename-nav-dev.aivencloud.com -port 26482 -ssl
```

## Support
We do not offer support on Influxdb as software, but questions about Aiven and provisioning can be directed to [#pig_aiven](https://nav-it.slack.com/archives/C018L1JATBQ) on Slack.

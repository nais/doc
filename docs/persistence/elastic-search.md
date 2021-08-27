# Elastic Search

The NAIS platform offers Elastic Search via [Aiven](https://aiven.io/).

## Get your own
As there are few teams that need an Elastic Search instance we use a IaC-repo to provision each instance.
Head over to [aiven-iac](https://github.com/navikt/aiven-iac#elastic-search) to learn how to get your own instance.
To make it easier for you, when creating the instance, we will also create four users with read, write, readwrite and admin access.

## Access from Nais-app
If you need access from an application, use the following [nais.yaml-reference](../nais-application/application.md#elastic).

When an application requesting an elastic instance is deployed, credentials will be provided as environment variables.
The service URI for Elastic is also available.
If you specify `elastic.access`, the credentials will be for the user with those access rights.
The available access levels are: 'admin', 'read', 'write', 'readwrite'
If not specified, the credentials will be for a user with read access.

| Environment variable | Description |
| -------------------- | ----------- |
| ELASTIC_USERNAME     | Username    |
| ELASTIC_PASSWORD     | Password    |
| ELASTIC_URI          | Service URI |

## Access from laptop
With Naisdevice you have access to the _aiven-prod_ gateway.
This is a JITA (just in time access) gateway, so you need to describe why, but the access is automatically given.

### Kibana
The URL for Kibana is the same as the Elastic instance, but using port 443 (regular https).

## Support
We do not offer support on Elastic Search as software, but questions about Aiven and provisioning can be directed to [#pig_aiven](https://nav-it.slack.com/archives/C018L1JATBQ) on Slack.

## Alerts
We recommend that you set up your own alerts so that you can react to problems in your Elastic instance. 
Aiven uses Telegraf to collect and present metrics, so available metrics can be found in the [Telegraf documentation](https://github.com/influxdata/telegraf).

We have configured our Prometheus instances in GCP to scrape the Elastic clusters in Aiven, so these metrics should be available in Grafana.
New Elastic clusters currently need to be manually added to the Prometheus config, so if you can't find your cluster, please poke us.

Particularly relevant input plugins are:

- [elasticsearch](https://github.com/influxdata/telegraf/tree/master/plugins/inputs/elasticsearch)
- [mem](https://github.com/influxdata/telegraf/tree/master/plugins/inputs/mem)
- [cpu](https://github.com/influxdata/telegraf/tree/master/plugins/inputs/cpu)
- [diskio](https://github.com/influxdata/telegraf/tree/master/plugins/inputs/diskio)
- [disk](https://github.com/influxdata/telegraf/tree/master/plugins/inputs/disk)

O'Reilly has a useful [article](https://www.oreilly.com/content/10-elasticsearch-metrics-to-watch/) about metrics to watch in an Elastic cluster.

[Awesome prometheus alerts](https://awesome-prometheus-alerts.grep.to/rules#elasticsearch) is another good source of alerts to look out for.

Some metrics that might be useful to watch, based on above article (We need feedback on this list, as we have no practical experience to lean on):

- `elasticsearch_cluster_health_status_code`
- `elasticsearch_cluster_health_active_shards`
- `elasticsearch_cluster_health_initializing_shards`
- `elasticsearch_cluster_health_relocating_shards`
- `elasticsearch_cluster_health_unassigned_shards`
- `elasticsearch_jvm_mem_heap_used_percent`
- `elasticsearch_jvm_gc_collectors_old_collection_time_in_millis`
- `elasticsearch_jvm_gc_collectors_young_collection_time_in_millis`
- `elasticsearch_jvm_mem_pools_old_used_in_byte` vs. `elasticsearch_jvm_mem_pools_old_max_in_bytes`
- `elasticsearch_jvm_mem_pools_survivor_used_in_byte` vs. `elasticsearch_jvm_mem_pools_survivor_max_in_bytes`
- `elasticsearch_jvm_mem_pools_young_used_in_byte` vs. `elasticsearch_jvm_mem_pools_young_max_in_bytes`
- `elasticsearch_indices_search_query_time_in_millis`
- `elasticsearch_indices_fielddata_evictions`
- `elasticsearch_indices_fielddata_memory_size_in_bytes`
- `elasticsearch_indices_indexing_index_time_in_millis`
- `elasticsearch_indices_indexing_index_total`
- `elasticsearch_indices_merges_total_time_in_millis`
- `elasticsearch_indices_store_size_in_bytes`
- `cpu_usage_user`
- `diskio_weighted_io_time`

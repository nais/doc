---
description: >-
  NAIS provides managed search index services through OpenSearch as a drop-in
  replacement for Elasticsearch. This page describes how to get started with
  OpenSearch for your applications.
---

# OpenSearch

OpenSearch is a fork of Elasticsearch that is maintained by Amazon. It is a drop-in replacement for Elasticsearch, and is fully compatible with the Elasticsearch API. It is a community-driven project that is open source and free to use.

OpenSearch is a distributed, RESTful search and analytics engine capable of solving a growing number of use cases. It is a good choice for storing data that is not relational in nature.

NAIS offers OpenSearch via [Aiven](https://aiven.io/).

## Getting started

As there are few teams that need an OpenSearch instance we use a IaC-repo to provision each instance.
Head over to [aiven-iac](https://github.com/navikt/aiven-iac#opensearch) to learn how to get your own instance.
To make it easier for you, when creating the instance, we will also create four users with read, write, readwrite and admin access.

## Access from Nais-app

If you need access from an application, use the following [nais.yaml-reference](../nais-application/application.md#openSearch).

When an application requesting an OpenSearch instance is deployed, credentials will be provided as environment variables.
The service URI for OpenSearch is also available.
If you specify `openSearch.access`, the credentials will be for the user with those access rights.
The available access levels are: 'admin', 'read', 'write', 'readwrite'
If not specified, the credentials will be for a user with read access.

| Environment variable | Description |
|----------------------| ----------- |
| OPEN_SEARCH_USERNAME | Username    |
| OPEN_SEARCH_PASSWORD | Password    |
| OPEN_SEARCH_URI      | Service URI |

## Access from laptop

With Naisdevice you have access to the _aiven-prod_ gateway.
This is a JITA (just in time access) gateway, so you need to describe why, but the access is automatically given.

### OpenSearch Dashboards

The URL for OpenSearch Dashboards (similar to Kibana) is the same as the OpenSearch instance, but using port 443 (regular https).

## Support

We do not offer support on OpenSearch as software, but questions about Aiven and provisioning can be directed to [#nais](https://nav-it.slack.com/archives/C5KUST8N6) on Slack.

## Alerts

We recommend that you set up your own alerts so that you can react to problems in your OpenSearch instance.
Aiven uses Telegraf to collect and present metrics, so available metrics can be found in the [Telegraf documentation](https://github.com/influxdata/telegraf).

We have configured our Prometheus instances in GCP to scrape the OpenSearch clusters in Aiven, so these metrics should be available in Grafana.

Particularly relevant input plugins are:

- [elasticsearch](https://github.com/influxdata/telegraf/tree/master/plugins/inputs/elasticsearch) (We belive the current open search plugin is very similar to this one)
- [mem](https://github.com/influxdata/telegraf/tree/master/plugins/inputs/mem)
- [cpu](https://github.com/influxdata/telegraf/tree/master/plugins/inputs/cpu)
- [diskio](https://github.com/influxdata/telegraf/tree/master/plugins/inputs/diskio)
- [disk](https://github.com/influxdata/telegraf/tree/master/plugins/inputs/disk)

OpenSearch is relatively new, so there aren't a lot of good resources on alerts/metrics for it yet.
However, since it is a fork of ElasticSearch, much of what is written about ElasticSearch applies to OpenSearch too.

The metrics use the prefix `opensearch` instead of `elasticsearch`, otherwise it looks like the same metrics are available.

O'Reilly has a useful [article](https://www.oreilly.com/content/10-elasticsearch-metrics-to-watch/) about metrics to watch in an Elastic cluster.

[Awesome prometheus alerts](https://awesome-prometheus-alerts.grep.to/rules#elasticsearch) is another good source of alerts to look out for.

Some metrics that might be useful to watch, based on above article (We need feedback on this list, as we have no practical experience to lean on):

- `opensearch_cluster_health_status_code`
- `opensearch_cluster_health_active_shards`
- `opensearch_cluster_health_initializing_shards`
- `opensearch_cluster_health_relocating_shards`
- `opensearch_cluster_health_unassigned_shards`
- `opensearch_jvm_mem_heap_used_percent`
- `opensearch_jvm_gc_collectors_old_collection_time_in_millis`
- `opensearch_jvm_gc_collectors_young_collection_time_in_millis`
- `opensearch_jvm_mem_pools_old_used_in_byte` vs. `opensearch_jvm_mem_pools_old_max_in_bytes`
- `opensearch_jvm_mem_pools_survivor_used_in_byte` vs. `opensearch_jvm_mem_pools_survivor_max_in_bytes`
- `opensearch_jvm_mem_pools_young_used_in_byte` vs. `opensearch_jvm_mem_pools_young_max_in_bytes`
- `opensearch_indices_search_query_time_in_millis`
- `opensearch_indices_fielddata_evictions`
- `opensearch_indices_fielddata_memory_size_in_bytes`
- `opensearch_indices_indexing_index_time_in_millis`
- `opensearch_indices_indexing_index_total`
- `opensearch_indices_merges_total_time_in_millis`
- `opensearch_indices_store_size_in_bytes`
- `cpu_usage_user`
- `diskio_weighted_io_time`

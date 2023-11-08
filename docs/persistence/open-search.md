---
---
description: >-
  NAIS provides managed search index services through OpenSearch as a drop-in
  replacement for Elasticsearch. This page describes how to get started with
  OpenSearch for your applications.
---

!!! warning "Availability"
    Aiven OpenSearch can be used by applications in all environments, but must be *defined* in a GCP cluster.


# OpenSearch

OpenSearch is a fork of Elasticsearch that is maintained by Amazon. It is a drop-in replacement for Elasticsearch, and is fully compatible with the Elasticsearch API. It is a community-driven project that is open source and free to use.

OpenSearch is a distributed, RESTful search and analytics engine capable of solving a growing number of use cases. It is a good choice for storing data that is not relational in nature.

NAIS offers OpenSearch via [Aiven](https://aiven.io/).

## Creating a OpenSearch instance

We recommend creating your OpenSearch instances in their own workflow for more control over configuration, especially if you intend for multiple applications using the same OpenSearch instance.

Creating a OpenSearch instance is done by adding a OpenSearch resource to your namespace with detailed configuration in a GCP cluster.
Some configuration is enforced by the nais platform, while the rest is up to the users.
OpenSearch instances created when we used Terraform have metrics integration already in place.
If you require metrics for a newly created OpenSearch instance, you also need to define a [ServiceIntegration](#ServiceIntegration) along with your OpenSearch instance.

In your `Application` or `Naisjob` specifications, you specify an instance and access.
In reality, the actual name of the opensearch instance will be `opensearch-<team name>-<instance name>` (where `team name` is the same as the namespace your application resides in).
The resource needs to have this full name in order to be accepted.

The minimal OpenSearch resource looks like this:

```yaml
apiVersion: aiven.io/v1alpha1
kind: OpenSearch
metadata:
  labels:
    team: myteam
  name: opensearch-myteam-sessions
  namespace: myteam
spec:
  plan: hobbyist
  project: nav-dev
```

A minimal OpenSearch resource only requires `plan` and `project`.

* `project` should match your nais tenant (`nav`, `ssb` or `fhi`) and the environment you are running in (ex. `dev`, `prod`), with a dash (`-`) in between.
* `plan` is the Aiven plan for your OpenSearch instance.
  See Aivens list of [possible plan values](https://aiven.io/pricing?product=opensearch).
  The values are lowercased.
  Make sure you understand the differences between the plans before selecting the one you need.
  Examples: `hobbyist`, `startup-4`, `startup-56`, `business-4`, `premium-14`.

We use Aivens operator, so the OpenSearch resource is [documented in detail](https://aiven.github.io/aiven-operator/api-reference/opensearch.html) in the Aiven documentation.
You should look at the reference for any other fields that might be of interest.

Probably the most important value to consider is which plan to use.

The Startup plans are good for things like sessions or cache usage, where High Availability in case of failures is not important.
Upgrades and regular maintenance is handled without noticeable downtime, by adding a new upgraded node and replicating data over to it before switching over DNS and shutting down the old node.
Startup plans are backed up every 12 hours, keeping 1 backup available.

If you require HA, the Business plans provide for a 3-node cluster with reads and writes distributed across the cluster.
Business plans are backed up every 12 hours, keeping 3 days of backups available.

Once the resource is added to the cluster, some additional fields are filled in by the platform and should be left alone unless you have a good reason:

| field                   |                                                                                                       | 
|-------------------------|-------------------------------------------------------------------------------------------------------|
| `projectVpcId`          | Ensures the instance is connected to the correct project VPC and is not available on public internet. |
| `tags`                  | Adds tags to the instance used for tracking billing in Aiven.                                         |
| `cloudName`             | Where the OpenSearch instance should run.                                                             |  
| `terminationProtection` | Protects the instance against unintended termination. Must be set to `false` before deletion.         |

There are some fields available that should not be used:

| field                  |                                                                                                 |
|------------------------|-------------------------------------------------------------------------------------------------|
| `authSecretRef`        | Reference to a secret containing an Aiven API token. Provided via other mechanisms.             |
| `connInfoSecretTarget` | Name of secret to put connection info in, not used as nais provides these via other mechanisms. |
| `projectVPCRef`        | Not used since we use `projectVpcId`.                                                           |
| `serviceIntegrations`  | Not used at this time.                                                                          |

### ServiceIntegration

A ServiceIntegration is used to integrate the OpenSearch instance with Prometheus.
It is pretty straight forward, with little to no configuration needed.

Simple 5 steps procedure:

1. Copy the below yaml into a file (it can be the same file as your OpenSearch instance)
2. Replace `nav-dev` with your project name (in field `project`)
   `project` should match your nais tenant (`nav`, `ssb` or `fhi`) and the environment you are running in (ex. `dev`, `prod`), with a dash (`-`) in between.
3. Replace `myteam` with your team name (in `labels`, `namespace` and `sourceServiceName`)
4. Replace `sessions` with the name of your OpenSearch instance (in `name` and `sourceServiceName`)
5. Replace `00000000-0000-0000-0000-000000000000` with the endpoint ID from the table below (in `destinationEndpointId`)
6. Deploy the resource using the same pipeline as you use for your OpenSearch instance


```yaml
---
apiVersion: aiven.io/v1alpha1
kind: ServiceIntegration
metadata:
  labels:
    team: myteam
  name: opensearch-myteam-sessions
  namespace: myteam
spec:
  project: nav-dev
  integrationType: prometheus
  destinationEndpointId: 00000000-0000-0000-0000-000000000000
  sourceServiceName: opensearch-myteam-sessions
```

#### Prometheus Endpoint IDs

| Environment | Endpoint ID                          |
|-------------|--------------------------------------|
| nav-dev     | f20f5b48-18f4-4e2a-8e5f-4ab3edb19733 |
| nav-prod    | 76685598-1048-4f56-b34a-9769ef747a92 |



### Previous usage

Previously, we defined the OpenSearch instances using terraform in the [aiven-iac](https://github.com/navikt/aiven-iac) IaC-repo.
As we are moving away from terraform for self-service services on Aiven, we will not be using this method anymore.

## Access from Nais-app

If you need access from an application, use the following [nais.yaml-reference](../nais-application/application.md#openSearch).

When an application requesting an OpenSearch instance is deployed, credentials will be provided as environment variables.
The service URI for OpenSearch is also available.
If you specify `openSearch.access`, the credentials will be for the user with those access rights.
The available access levels are: 'admin', 'read', 'write', 'readwrite'
If not specified, the credentials will be for a user with read access.

| Environment variable | Description |
|----------------------|-------------|
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

In order to receive metrics in Grafana, you need to configure a [ServiceIntegration](#ServiceIntegration) for your OpenSearch instance.

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

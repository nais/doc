---
tags: [kafka, reference]
---

# Kafka Pools

This is a list of available Kafka pools for [topics](../how-to/create.md) and [applications](../how-to/access.md).

{% if tenant() == "nav" %}

Topic resources can only be specified in GCP clusters.
Applications can access topics from any cluster, including on-premises.

Use the `nav-dev` pool for development and `nav-prod` for production.

| Pool                 | Min. replication | Max. replication | Topic declared in | Available from                               |
|:---------------------|:-----------------|:-----------------|:------------------|:---------------------------------------------|
| `nav-dev`            | 2                | 3                | `dev-gcp`         | `dev-gcp`, `dev-fss`                         |
| `nav-prod`           | 2                | 9                | `prod-gcp`        | `prod-gcp`, `prod-fss`                       |

{% else %}

No Kafka pools available for your tenant.

{% endif %}

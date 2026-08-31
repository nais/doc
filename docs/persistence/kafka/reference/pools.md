---
tags: [kafka, reference]
conditional: [not-test-nais]
---

# Kafka Pools

This is a list of available Kafka pools for [topics](../how-to/create.md) and [applications](../how-to/access.md).

{% if tenant() == "nav" %}

Topic resources can only be specified in GCP clusters.
Applications can access topics from any cluster, including on-premises.

Use the `nav-dev` pool for development and `nav-prod` for production.

| Pool       | Min. replication | Max. replication | Topic declared in | Available from         |
|:-----------|:-----------------|:-----------------|:------------------|:-----------------------|
| `nav-dev`  | 2                | 3                | `nav-dev`         | `nav-dev`, `dev-fss`   |
| `nav-prod` | 2                | 9                | `nav-prod`        | `nav-prod`, `prod-fss` |

{% elif tenant() == "atil" %}

Use the `<<tenant()>>-dev` pool for development and `<<tenant()>>-prod` for production.

| Pool                | Available from |
|:--------------------|:---------------|
| `<<tenant()>>-dev`  | `dev`          |
| `<<tenant()>>-prod` | `prod`         |

{% else %}

No Kafka pools available for your tenant.

{% endif %}

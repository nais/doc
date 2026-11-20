---
tags: [workloads, reference, clusters]
---

# Environments

Environments are also called _clusters_. Each environment has its own ingress domains and external IPs.
External IPs are used for outbound traffic to services that require IP allow-listing.

{% for env in environments() %}
### <<env.name>>

#### Domains

| domain | accessible from | description |
| :----- | :-------------- | :---------- |
{% for d in env.domains %}
| <<d.name>> | {% if d.external %}internet{% else %}[naisdevice][naisdevice]{% endif %} | {% if d.external %}ingress for applications exposed to internet. URLs containing `/metrics`, `/actuator` or `/internal` are blocked.{% else %}ingress for internal applications{% endif %} |
{% endfor %}

#### External/outbound IPs

<<external_ips(env.name)>>

{% endfor %}
{% if not has_environments() %}
No environments documented for this tenant yet.
{% endif %}

{% if tenant() == "nav" %}
## On-prem

!!! warning

    This is a legacy environment, and is not open for new workloads.

### dev-fss

#### Ingress domains

| domain              | accessible from | description                                                                                          |
| :------------------ | :-------------- | :--------------------------------------------------------------------------------------------------- |
| intern.dev.nav.no   | [naisdevice]    | development ingress for internal applications. Also available in dev-gcp, use this to ease migration |
| dev-fss-pub.nais.io | GCP             | See [How do I reach an application found on-premises from my application in GCP?][on-prem]           |

### prod-fss

#### Ingress domains

| domain               | accessible from | description                                                                                                                                                                |
| :------------------- | :-------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| intern.nav.no        | [naisdevice]    | ingress for internal applications (supersedes nais.adeo.no). Also available in prod-gcp, use this to ease migration. Requires [JITA][naisdevice-jita] to `onprem-k8s-prod` |
| prod-fss-pub.nais.io | GCP             | See [How do I reach an application found on-premises from my application in GCP?][on-prem]                                                                                 |

[on-prem]: ../explanations/migrating-to-gcp.md#how-do-i-reach-an-application-found-on-premises-from-my-application-in-gcp

#### External IPs

- 155.55.65.50 (with webproxy)
- 155.55.51.x/24 (without webproxy)
{% endif %}
{% if has_environments() %}

## Observability

All clusters share the same observability defaults.

| data                 | default                         |
| :------------------- | :------------------------------ |
| logs (stdout)        | `<<default_log_destination()>>` |
| auto-instrumentation | `grafana-lgtm`                  |

{% endif %}

[naisdevice]: ../../operate/naisdevice/README.md
[naisdevice-jita]: ../../operate/naisdevice/explanations/jita.md
[expose-app]: ../../workloads/application/explanations/expose.md

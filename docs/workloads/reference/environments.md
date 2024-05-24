---
tags: [workloads, reference]
---

# Environments

This is a overview over the different environments and their available domains.

We also enumerate the external IPs used by the environments, so that you can provide them to services that require IP allow-listing.

{% if tenant() == "nav" %}
## Google Cloud Platform (GCP)

### dev-gcp

#### Ingress domains

| domain             | accessible from                                              | notes                                                              |
|:-------------------|:-------------------------------------------------------------|--------------------------------------------------------------------|
| ekstern.dev.nav.no | internet                                                     | URLs containing `/metrics`, `/actuator` or `/internal` are blocked | 
| intern.dev.nav.no  | NAV internal networks (including [naisdevice])               |                                                                    | 
| ansatt.dev.nav.no  | internet, only for authenticated humans on compliant devices | URLs containing `/metrics`, `/actuator` or `/internal` are blocked |

See [explanation for exposing application][expose-app] for more information.

#### External IPs

- 35.228.4.248
- 34.88.219.93
- 35.228.165.176

### prod-gcp

#### Ingress domains

| domain        | accessible from                                              | notes                                                              |
|:--------------|:-------------------------------------------------------------|--------------------------------------------------------------------|
| nav.no        | internet                                                     | URLs containing `/metrics`, `/actuator` or `/internal` are blocked |
| intern.nav.no | NAV internal networks (including [naisdevice])               |                                                                    | 
| ansatt.nav.no | internet, only for authenticated humans on compliant devices | URLs containing `/metrics`, `/actuator` or `/internal` are blocked | 

See [explanation for exposing application][expose-app] for more information.

#### External IPs

- 35.228.235.189
- 35.228.12.134
- 35.228.189.194


## On-prem

!!! warning

    This is a legacy environment, and is not recommended for new workloads. 

### dev-fss

#### Ingress domains

| domain              | accessible from | description                                                                                          |
|:--------------------|:----------------|:-----------------------------------------------------------------------------------------------------|
| intern.dev.nav.no   | [naisdevice]    | development ingress for internal applications. Also available in dev-gcp, use this to ease migration |
| dev-fss-pub.nais.io | GCP             | See [How do I reach an application found on-premises from my application in GCP?][on-prem]           |

### prod-fss

#### Ingress domains

| domain               | accessible from | description                                                                                                                                                                |
|:---------------------|:----------------|:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| intern.nav.no        | [naisdevice]    | ingress for internal applications (supersedes nais.adeo.no). Also available in prod-gcp, use this to ease migration. Requires [JITA][naisdevice-jita] to `onprem-k8s-prod` |
| prod-fss-pub.nais.io | GCP             | See [How do I reach an application found on-premises from my application in GCP?][on-prem]                                                                                 |

[on-prem]: ../explanations/migrating-to-gcp.md#how-do-i-reach-an-application-found-on-premises-from-my-application-in-gcp

{% endif %}
{% if tenant() == "ssb" %}
### staging

#### Domains

| domain                             | accessible from          | description                                                                                                       |
|:-----------------------------------|:-------------------------|:------------------------------------------------------------------------------------------------------------------|
| external.staging.ssb.cloud.nais.io | internet                 | ingress for applications exposed to internet. URLs containing `/metrics`, `/actuator` or `/internal` are blocked. |
| staging.ssb.cloud.nais.io          | [naisdevice][naisdevice] | ingress for internal applications                                                                                 |

#### External/outbound IPs

- 34.88.116.202

### prod

#### Domains

| domain                          | accessible from | description                                                                                                       |
|:--------------------------------|:----------------|:------------------------------------------------------------------------------------------------------------------|
| external.prod.ssb.cloud.nais.io | internet        | ingress for applications exposed to internet. URLs containing `/metrics`, `/actuator` or `/internal` are blocked. |
| prod.ssb.cloud.nais.io          | [naisdevice]    | ingress for internal applications                                                                                 |

#### External/outbound IPs

- 34.88.47.40
{% endif %}

[naisdevice]: ../../operate/naisdevice/README.md
[naisdevice-jita]: ../../operate/naisdevice/explanations/jita.md
[expose-app]: ../../workloads/application/explanations/expose.md

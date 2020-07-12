# On-premise clusters

The on-premise Kubernetes clusters are split across two zones and two environments:

| cluster | zone | environment |
| ------- | ---- | ----------- |
| `dev-fss` | fagsystemsonen | development |
| `dev-sbs` | selvbetjeningssonen | development |
| `prod-fss` | fagsystemsonen | production |
| `prod-sbs` | selvbetjeningssonen | production |

## Accessing the application

Access is controlled in part by ingresses, which define where your application will be exposed as a HTTP endpoint.
You can control where your application is reachable from by selecting the appropriate ingress domain.

{% hint style="warning" %}
Make sure you understand where you expose your application, taking into account
the state of your application, what kind of data it exposes and how it is
secured. If in doubt, ask in #nais or someone on the NAIS team.
{% endhint %}

You can control from where you application is reachable by selecting the appropriate ingress domain.

### dev-fss

| domain | accessible from | description |
| ------ | --------------- | ----------- |
| dev.adeo.no | [naisdevice](../device/README.md) | development ingress for adeo.no applications |
| intern.dev.adeo.no | internal network only | development ingress for adeo.no applications |
| dev-fss.nais.io | [naisdevice](../device/README.md) | [nais cluster services only](https://github.com/navikt/pig/blob/master/kubeops/adr/004-common-ingresses.md), use {intern,}.dev.adeo.no instead |
| nais.preprod.local | vdi | **deprecated**, use {intern,}.dev.adeo.no instead |

### dev-sbs

| domain | accessible from | description |
| ------ | --------------- | ----------- |
| dev.nav.no | [naisdevice](../device/README.md) | development ingress for nav.no applications |
| intern.dev.nav.no | internal network only | development ingress for adeo.no applications |
| dev-sbs.nais.io | [naisdevice](../device/README.md) | [nais cluster services only](https://github.com/navikt/pig/blob/master/kubeops/adr/004-common-ingresses.md), use {intern,}.dev.nav.no instead |
| nais.oera-q.local | vdi | **deprecated**, use {intern,}.nav.adeo.no instead |

### prod-fss

| domain | accessible from | description |
| ------ | --------------- | ----------- |
| adeo.no | case workers, [naisdevice](../device/README.md) by allowlist | manually configured, contact at #tech-sikkerhet |
| prod-fss.nais.io | [naisdevice](../device/README.md) | [nais cluster services only](https://github.com/navikt/pig/blob/master/kubeops/adr/004-common-ingresses.md), use .adeo.no instead |
| nais.adeo.no | vdi | **deprecated**, use .adeo.no instead |

### prod-sbs

| domain | accessible from | description |
| ------ | --------------- | ----------- |
| nav.no | internet | manually configured, contact at #tech-sikkerhet |
| tjenester.nav.no | internet | context root based routing on format `tjenester.nav.no/<appname>`. |
| prod-sbs.nais.io | [naisdevice](../device/README.md) | [nais cluster services only](https://github.com/navikt/pig/blob/master/kubeops/adr/004-common-ingresses.md), use .nav.no instead |
| nais.oera.no | vdi | **deprecated**, use .nav.no instead |

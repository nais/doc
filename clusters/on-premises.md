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
| intern.dev.nav.no | internal network only | development ingress for nav.no applications |
| dev-sbs.nais.io | [naisdevice](../device/README.md) | [nais cluster services only](https://github.com/navikt/pig/blob/master/kubeops/adr/004-common-ingresses.md), use {intern,}.dev.nav.no instead |
| nais.oera-q.local | vdi | **deprecated**, use {intern,}.dev.nav.no instead |

### prod-fss

| domain | accessible from | description |
| ------ | --------------- | ----------- |
| nais.adeo.no | vdi | automatically configured |
| prod-fss.nais.io | [naisdevice](../device/README.md) | [nais cluster services only](https://github.com/navikt/pig/blob/master/kubeops/adr/004-common-ingresses.md), use nais.adeo.no instead |

### prod-sbs

| domain | accessible from | description |
| ------ | --------------- | ----------- |
| nav.no | internet | currently manually configured by #tech-sikkerhet |
| nais.oera.no | vdi | automatically configured. Typically used by backend/admin apps not exposed to end-users |
| tjenester.nav.no | internet | context root based routing on format `tjenester.nav.no/<appname>`. |
| prod-sbs.nais.io | [naisdevice](../device/README.md) | [nais cluster services only](https://github.com/navikt/pig/blob/master/kubeops/adr/004-common-ingresses.md), use nav.no/nais.oera.no instead |

More info about how DNS is configured for these domains can be found [here](../appendices/ingress-dns.md)

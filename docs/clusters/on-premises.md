# On-premises

The on-premise Kubernetes clusters are split across two zones and two environments:

| cluster | zone | environment |
| :--- | :--- | :--- |
| `dev-fss` | fagsystemsonen | development |
| `dev-sbs` | selvbetjeningssonen | development |
| `prod-fss` | fagsystemsonen | production |
| `prod-sbs` | selvbetjeningssonen | production |

## Accessing the application

Access is controlled in part by ingresses, which define where your application will be exposed as a HTTP endpoint. You can control where your application is reachable from by selecting the appropriate ingress domain.

!!! warning
    Make sure you understand where you expose your application, taking into account the state of your application, what kind of data it exposes and how it is secured. If in doubt, ask in \#nais or someone on the NAIS team.


You can control from where you application is reachable by selecting the appropriate ingress domain.

### dev-fss

| domain | accessible from | description |
| :--- | :--- | :--- |
| dev.intern.nav.no | [naisdevice](../device/) | development ingress for dev internal applications (supersedes dev.adeo.no). Also available in dev-gcp, use this to ease migration |
| dev.adeo.no | [naisdevice](../device/) | development ingress for adeo.no applications |
| intern.dev.adeo.no | internal network only | development ingress for adeo.no applications |
| dev-fss.nais.io | [naisdevice](../device/) | reserved for platform services |
| dev-fss-pub.nais.io | GCP | Exposing applications to GCP requires a manual entry in BigIP as well. Contact #nais-i-sky |
| nais.preprod.local | vdi | **deprecated**, use .dev.intern.nav.no instead |

### dev-sbs

| domain | accessible from | description |
| :--- | :--- | :--- |
| dev.nav.no | [naisdevice](../device/) | development ingress for nav.no applications |
| intern.dev.nav.no | internal network only | development ingress for nav.no applications |
| dev-sbs.nais.io | [naisdevice](../device/) | reserved for platform services |
| nais.oera-q.local | vdi | **deprecated**, use {intern,}.dev.nav.no instead |

### prod-fss

| domain | accessible from | description |
| :--- | :--- | :--- |
| intern.nav.no | [naisdevice](../device/) | ingress for internal applications (supersedes nais.adeo.no). Also available in prod-gcp, use this to ease migration |
| nais.adeo.no | vdi | automatically configured |
| prod-fss.nais.io | [naisdevice](../device/) | reserved for platform services |
| prod-fss-pub.nais.io | GCP | Exposing applications to GCP requires a manual entry in BigIP as well. Contact #nais-i-sky |

### prod-sbs

| domain | accessible from | description |
| :--- | :--- | :--- |
| nav.no | internet | currently manually configured by \#tech-sikkerhet |
| nais.oera.no | vdi | automatically configured. Typically used by backend/admin apps not exposed to end-users |
| tjenester.nav.no | internet | context root based routing on format `tjenester.nav.no/<appname>`. |
| prod-sbs.nais.io | [naisdevice](../device/) | reserved for platform services |

More info about how DNS is configured for these domains can be found [here](../appendix/ingress-dns.md)


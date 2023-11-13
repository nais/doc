# On-premises

The on-premise Kubernetes clusters are split across two zones and two environments:

| cluster        | zone                | environment |
|:---------------|:--------------------|:------------|
| `dev-fss`      | fagsystemsonen      | development |
| `prod-fss`     | fagsystemsonen      | production  |

## Accessing the application

Access is controlled in part by ingresses, which define where your application will be exposed as a HTTP endpoint. You can control where your application is reachable from by selecting the appropriate ingress domain.

!!! warning
    Make sure you understand where you expose your application, taking into account the state of your application, what kind of data it exposes and how it is secured. If in doubt, ask in \#nais or someone on the NAIS team.


You can control from where you application is reachable by selecting the appropriate ingress domain.

### dev-fss

| domain              | accessible from          | description                                                                                                                                                                       |
|:--------------------|:-------------------------|:----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| intern.dev.nav.no   | [naisdevice](../device/) | development ingress for internal applications. Also available in dev-gcp, use this to ease migration                                                                              |
| dev.intern.nav.no   | [naisdevice](../device/) | **deprecated** development ingress for internal applications (use intern.dev.nav.no instead)                                                                                      |
| dev.adeo.no         | [naisdevice](../device/) | **deprecated** development ingress for adeo.no applications (use intern.dev.nav.no instead)                                                                                       |
| intern.dev.adeo.no  | internal network only    | **deprecated** development ingress for adeo.no applications that should not be reached from naisdevice                                                                            |
| nais.preprod.local  | VDI                      | **deprecated**, use .intern.dev.nav.no instead                                                                                                                                    |
| dev-fss-pub.nais.io | GCP                      | See [How do I reach an application found on-premises from my application in GCP?](migrating-to-gcp.md#how-do-i-reach-an-application-found-on-premises-from-my-application-in-gcp) |

### prod-fss

| domain               | accessible from          | description                                                                                                                                                                       |
|:---------------------|:-------------------------|:----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| intern.nav.no        | [naisdevice](../device/) | ingress for internal applications (supersedes nais.adeo.no). Also available in prod-gcp, use this to ease migration. Requires [JITA](../device/jita.md) to `onprem-k8s-prod`      |
| nais.adeo.no         | vdi                      | automatically configured                                                                                                                                                          |
| prod-fss-pub.nais.io | GCP                      | See [How do I reach an application found on-premises from my application in GCP?](migrating-to-gcp.md#how-do-i-reach-an-application-found-on-premises-from-my-application-in-gcp) |


You can also learn about [how DNS is configured](../appendix/ingress-dns.md) for these domains.


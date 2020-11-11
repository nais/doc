# Google Cloud Platform

| cluster | environment | comment |
| :--- | :--- | :--- |
| `dev-gcp` | development | selected ingresses publicly accessible |
| `prod-gcp` | production | publicly accessible |
| `labs-gcp` | development | publicly accessible |

In GCP, we do not operate with a zone model like with the on-premise clusters. Instead, we rely on a [zero trust](../appendix/zero-trust.md) model with a service mesh. The only thing we differentiate on a cluster level is development and production.

The applications running in GCP need [access policy rules defined](../nais-application/access-policy.md) for every other service they receive requests from or sends requests to.

To access the GCP clusters, see [Access](../basics/access.md#google-cloud-platform-gcp).

## Accessing the application

Access is controlled in part by ingresses, which define where your application will be exposed as a HTTP endpoint. You can control where your application is reachable from by selecting the appropriate ingress domain.

!!! warning
    Make sure you understand where you expose your application, taking into account the state of your application, what kind of data it exposes and how it is secured. If in doubt, ask in \#nais or someone on the NAIS team.


You can control from where you application is reachable by selecting the appropriate ingress domain. If no ingress is selected, the application will not be reachable from outside the cluster.

### dev-gcp ingresses

| domain | accessible from | description |
| :--- | :--- | :--- |
| ekstern.dev.nav.no | internet | manually configured by adding to `external_domains` in [load balancer config](https://github.com/nais/gcp/blob/master/infrastructure/dev.tfvars) and making a pull request |
| dev.nav.no | [naisdevice](../device/README.md) | development ingress for nav.no applications |
| dev.intern.nav.no | [naisdevice](../device/README.md) | development ingress for non-public/internet-facing applications |
| dev-gcp.nais.io | [naisdevice](../device/README.md) | reserved for platform services |
| ~~dev.adeo.no~~ |  | _deprecated_ replaced by dev.intern.nav.no |

### prod-gcp ingresses

| domain | accessible from | description |
| :--- | :--- | :--- |
| nav.no | internet | manually configured, contact at \#tech-sikkerhet |
| intern.nav.no | [naisdevice](../device/README.md) | used by non-public/internet-facing applications \(previously called adeo.no\). |
| prod-gcp.nais.io | [naisdevice](../device/README.md) | reserved for platform services |

More info about how DNS is configured for these domains can be found [here](../appendix/ingress-dns.md)

### labs-gcp ingresses

| domain | accessible from | description |
| :--- | :--- | :--- |
| labs.nais.io | internet | automatically configured |

## ROS and PVK

When establishing an application on GCP, it is a great time to update its [Risikovurdering \(ROS\)](https://navno.sharepoint.com/sites/intranett-it/SitePages/Risikovurderinger.aspx) analysis. It is required to update the application's entry in the [Behandlingsoversikt](https://navno.sharepoint.com/sites/intranett-personvern/SitePages/Behandlingskatalog.aspx) when changing platforms. If both of these words are unfamiliar to your team, it's time to sit down and take a look at both of them.

Every application needs to have a [ROS](https://navno.sharepoint.com/sites/intranett-it/SitePages/Risikovurderinger.aspx) analysis, and applications handling personal information needs a [Personvernkonsekvens \(PVK\)](https://navno.sharepoint.com/sites/intranett-personvern/SitePages/PVK.aspx) analysis, and furthermore an entry in the [Behandlingsoversikt](https://navno.sharepoint.com/sites/intranett-personvern/SitePages/Behandlingskatalog.aspx). More information about [ROS](https://navno.sharepoint.com/sites/intranett-it/SitePages/Risikovurderinger.aspx), [PVK](https://navno.sharepoint.com/sites/intranett-personvern/SitePages/PVK.aspx), and [Behandlingsoversikt](https://navno.sharepoint.com/sites/intranett-personvern/SitePages/Behandlingskatalog.aspx) can be found on our intranet. Questions about ROS can be directed to [Leif Tore Løvmo](https://nav-it.slack.com/messages/DB4DDCACF), while [Line Langlo Spongsveen](https://nav-it.slack.com/messages/DNXJ7PMH7) can answer questions about the other two.


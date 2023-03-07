# Google Cloud Platform

Google Cloud Platform (GCP) is a cloud computing platform and infrastructure provider often just referred to as "Google Cloud". New features to the NAIS platform are often exclusively available on GCP first, and we are actively encouraging teams to [migrate their applications to GCP](./migrating-to-gcp.md).

??? info "List of NAIS clusters in GCP"

    | cluster    | environment | comment                                |
    |:-----------|:------------|:---------------------------------------|
    | `dev-gcp`  | development | selected ingresses publicly accessible |
    | `prod-gcp` | production  | publicly accessible                    |
    | `labs-gcp` | development | publicly accessible                    |

In GCP, we do not operate with a zone model like with the on-premise clusters. Instead, we rely on a [zero trust model](../appendix/zero-trust.md) with a service mesh. The only thing we differentiate on a cluster level is development and production.

The applications running in GCP need [access policy rules](../nais-application/access-policy.md) defined for every other service they receive requests from or sends requests to.

Make sure you have [access to GCP clusters.](../basics/access.md#google-cloud-platform-gcp).

## Supported features

* [BigQuery](/persistence/bigquery)
* [Cloud Storage](/persistence/buckets)
* [Cloud SQL](/persistence/postgres)
* [Cloud Armor](/security/cloud-armor)
* [Secret Manager](/security/secrets/google-secrets-manager)

## Access to GCP

In order to use GCP, a team is required to add their team in [NAIS console](https://console.nav.cloud.nais.io).
This will generate a namespace for the team in each cluster, and dev and prod GCP projects will be created.
The team's group is initially granted a restricted set of permissions in these projects, but have the ability to grant further permissions on demand using the [GCP console](https://console.cloud.google.com)

!!! warning
    With the ability to grant permissions, the team has full control of the team's GCP projects, and should take care when granting further permissions or enabling features and APIs.

## Accessing the application

Access is controlled in part by ingresses, which define where your application will be exposed as a HTTP endpoint. You can control where your application is reachable from by selecting the appropriate ingress domain.

!!! warning
    Make sure you understand where you expose your application, taking into account the state of your application, what kind of data it exposes and how it is secured. If in doubt, ask in \#nais or someone on the NAIS team.


You can control from where you application is reachable by selecting the appropriate ingress domain. If no ingress is selected, the application will not be reachable from outside the cluster.

### dev-gcp ingresses

| domain             | accessible from                   | description                                                                                                                   |
|:-------------------|:----------------------------------|:------------------------------------------------------------------------------------------------------------------------------|
| ekstern.dev.nav.no | internet                          | development ingress for applications exposed to internet. URLs containing `/metrics`, `/actuator` or `/internal` are blocked. |
| intern.dev.nav.no  | [naisdevice](../device/README.md) and NAV internal networks | development ingress for non-public/internet-facing applications                                                               |

### prod-gcp ingresses

| domain        | accessible from                   | description                                                                                                                                                                              |
| :------------ | :-------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| nav.no        | internet                          | subdomains are manually configured, contact at \#tech-sikkerhet. Ingresses on `nav.no/*` are automatically available. URLs containing `/metrics`, `/actuator` or `/internal` are blocked |
| intern.nav.no | [naisdevice](../device/README.md) | used by non-public/internet-facing applications \(previously called adeo.no\).                                                                                                           |

You can also learn about [how DNS is configured.](../appendix/ingress-dns.md)

### labs-gcp ingresses

| domain       | accessible from | description              |
|:-------------|:----------------|:-------------------------|
| labs.nais.io | internet        | automatically configured |

!!! warning
    Note that the `labs-gcp` cluster is a separate cluster, primarily meant for deploying simple demos with mocks.

    It does **not** provide any features or integrations that are present in the normal clusters (e.g. Kafka, Azure, etc.)

## ROS and PVK

When establishing an application on GCP, it is a great time to update its [platform privacy impact assessments (*ROS*).](https://navno.sharepoint.com/sites/intranett-it/SitePages/Risikovurderinger.aspx) It is required to update the application's entry in the [*Behandlingsoversikt*](https://navno.sharepoint.com/sites/intranett-personvern/SitePages/Behandlingskatalog.aspx) when changing platforms. If both of these words are unfamiliar to your team, it's time to sit down and take a look at both of them.

Every application needs to have a *ROS* analysis.
Applications handling personal information needs a [data protection impact assessment (*PVK*)](https://navno.sharepoint.com/sites/intranett-personvern/SitePages/PVK.aspx) and an entry in the *Behandlingsoversikt*.

See also additional information about [*ROS* for applications using nais](../legal/app-ros.md) and [*PVK* for applications using nais](../legal/app-pvk.md) under Laws and regulations.

Questions about ROS can be directed to Leif Tore Løvmo or Line Langlo Spongsveen or posted in [#tryggnok](https://nav-it.slack.com/archives/CQ0D5HLSW). Questions about *Behandling* should be directed to [#behandlingskatalogen](https://nav-it.slack.com/archives/CR1B19E6L).


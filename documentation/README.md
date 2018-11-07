
NAIS documentation
==================
<img align="left" width="60" height="80" src="https://raw.githubusercontent.com/nais/doc/master/documentation/media/nais.png">
NAIS is an application platform built to increase development speed by providing our developers with the best possible tools to develop, test and run their applications.

Also, follow our [changelog](/documentation/changelog.md) to easily stay up to date on new milestones and services.


## Getting started

New users and developers should head over to the [getting started guide](/documentation/dev-guide/README.md#getting-started), which cover both how to set up the environment, and how to start using the platform. 
Note that this guide is specific to [NAV](https://nav.no) and links to private repositories and config files.
After that you can read more about the [platform](/documentation/platform.md), and the NAIS [contracts](/README.md#contracts).


## Developer guide

* [Naisd](/documentation/dev-guide/naisd.md)
* [Naiserator](/documentation/dev-guide/naiserator.md)
* [Migration](/documentation/dev-guide/migration.md)
* [Getting started](/documentation/dev-guide/README.md#getting-started)


## Contracts

* [Alerts](/documentation/contracts/alerts.md)
* [AM](contracts/am.md) (Norwegian)
* [Fasit resources](/documentation/contracts/fasit_resources.md)
* [Logging](/documentation/contracts/logging.md)
* [Metrics](/documentation/contracts/metrics.md)
* [Vault](/documentation/contracts/vault.md)
* [NAIS manifest](/documentation/contracts/README.md#nais-manifest)


## Services

* [Kubernetes dashboard](/documentation/services/kubernetes_dashboard.md)
* [Leader election](/documentation/services/leader_election.md)
* [Redis](/documentation/services/redis.md)


## Clusters


### On-premise

| Name            | Domain               | Purpose               |
| --------------- | -------------------- | --------------------- |
| **prod-fss**    | *.nais.adeo.no       | Production in FSS     |
| **prod-sbs**    | *.nais.oera.no       | Production in SBS     |
| **preprod-fss** | *.nais.preprod.local | Non production in FSS |
| **preprod-sbs** | *.nais.oera-q.local  | Non production in SBS |


### Google Kubernetes Engine (GKE)

We are also working on setting up several clusters in [Google Kubernetes Engine](https://cloud.google.com/kubernetes-engine/).


### Azure Kubernetes Service (AKS)

Similar to GKE, we are also working with Microsoft and [Azure Kubernetes Service](https://azure.microsoft.com/en-us/doc/services/kubernetes-service/).


## Web services

| Service                       | Address                   |
| ----------------------------- | ------------------------- |
| [Deploy](/documentation/dev-guide/naisd.md)    | `https://deploy.{domain}` |
| [Logs](/documentation/contracts/logging.md)    | https://logs.adeo.no      |
| [Metrics](/documentation/contracts/metrics.md) | https://grafana.adeo.no   |


## Contact us

The platform team can be found either on [Slack](https://nav-it.slack.com/messages/C5KUST8N6/) or in Sannergata 2, 2nd floor, room 2201 (Oslo, Norway). Also, follow us on Twitter [@nais_io](https://twitter.com/nais_io).

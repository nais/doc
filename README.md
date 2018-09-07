
NAIS documentation
==================
<img align="left" width="100" height="100" src="https://raw.githubusercontent.com/nais/doc/master/doc/media/nais.png">
NAIS is an application platform built to increase development speed by providing our developers with the best possible tools to develop, test and run their applications.

Also, follow our [changelog](/doc/changelog.md) to easily stay up to date on new milestones and services.


## Getting started

New users and developers should head over to the [getting started guide](/doc/dev-guide/README.md#getting-started), which cover both how to set up the environment, and how to start using the platform. After that you can read more about the [platform](/doc/platform.md), and the NAIS [contracts](/README.md#contracts).


## Developer guide

* [Naisd](/doc/dev-guide/naisd.md)
* [Migration](/doc/dev-guide/migration.md)
* [Getting started](/doc/dev-guide/README.md#getting-started)


## Contracts

* [Alerts](/doc/contracts/alerts.md)
* [AM](contracts/am.md) (Norwegian)
* [Fasit resources](/doc/contracts/fasit_resources.md)
* [Logging](/doc/contracts/logging.md)
* [Metrics](/doc/contracts/metrics.md)
* [NAIS manifest](/doc/contracts/README.md#nais-manifest)


## Services

* [Kubernetes dashboard](/doc/services/kubernetes_dashboard.md)
* [Leader election](/doc/services/leader_election.md)
* [Redis](/doc/services/redis.md)


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
| [Deploy](/doc/dev-guide/naisd.md)    | `https://deploy.{domain}` |
| [Logs](/doc/contracts/logging.md)    | https://logs.adeo.no      |
| [Metrics](/doc/contracts/metrics.md) | https://grafana.adeo.no   |


## Contact us

The platform team can be found either on [Slack](https://nav-it.slack.com/messages/C5KUST8N6/) or in Sannergata 2, 2nd floor, room 2201.

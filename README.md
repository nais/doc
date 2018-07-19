NAIS documentation
==================

![NAIS logo](/_media/nais.png)

NAIS is an application platform built to increase development speed by providing our developers with the best possible tools to develop, test and run their applications.


## Getting started

New users and developers should head over to the [getting started guide](/dev-guide#getting-started), which cover both how to set up the environment, and how to start using the platform. After that you can read more about the [platform](/platform.md), and the NAIS [contracts](/#contracts).


## Developer guide

* [Naisd](/dev-guide/naisd.md)
* [Migration](/dev-guide/migration.md)
* [NAV proxy](/dev-guide/nav_proxy.md)
* [Getting started](/dev-guide#getting-started)
* [Service discovery](/dev-guide/service_discovery.md)


## Contracts

* [Alerts](/contracts/alerts.md)
* [AM](contracts/am.md) (Norwegian)
* [Logging](/contracts/logging.md)
* [Metrics](/contracts/metrics.md)
* [NAIS manifest](/contracts#nais-manifest)


## Services

* [Kubernetes dashboard](/services/kubernetes_dashboard.md)
* [Leader election](/services/leader_election.md)
* [Redis](/services/redis.md)


## Clusters

### On-premises

| Name            | Domain               | Purpose               |
| --------------- | -------------------- | --------------------- |
| **prod-fss**    | *.nais.adeo.no       | Production in FSS     |
| **prod-sbs**    | *.nais.oera.no       | Production in SBS     |
| **preprod-fss** | *.nais.preprod.local | Non production in FSS |
| **preprod-sbs** | *.nais.oera-q.local  | Non production in SBS |


### Google Kubernetes Engine (GKE)

We are also working on setting up several clusters in [Google Kubernetes Engine](https://cloud.google.com/kubernetes-engine/).


### Azure Kubernetes Service (AKS)

Similar to GKE, we are also working with Microsoft and [Azure Kubernetes Service](https://azure.microsoft.com/en-us/services/kubernetes-service/).


## Web services

| Service                       | Address                   |
| ----------------------------- | ------------------------- |
| [Deploy](/dev-guide/naisd.md)    | `https://deploy.{domain}` |
| [Logs](/contracts/logging.md)    | https://logs.adeo.no      |
| [Metrics](/contracts/metrics.md) | https://grafana.adeo.no   |


## Contact us

Team Aura can be found either on [#nais@Slack](https://nav-it.slack.com/messages/C5KUST8N6/) or in Sannergata 2, 2nd floor, room 2201.

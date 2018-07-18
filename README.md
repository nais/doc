NAIS documentation
==================

![NAIS logo](/_media/nais.pnga)

NAIS is an application platform built to increase development speed by providing our developers with the best possible tools to develop, test and run their applications.

There are many excellent Open Source tools available today; in fact, the possibilities are so many that just wrapping your head around the available options is quite a daunting task. 

It didn't make sense that all of our developers should spend their time figuring out the best combination of tools individually, which is why we created NAIS.

NAIS is a collection of the Open Source tools we have found best suited to deploy, run, monitor and analyze NAVs applications, as well as the tools we have created to build and maintain the platform itself.


## Getting started

New users and developers should head over to the [getting started guide](/dev-guide/getting_started), which cover both how to set up the environment, and how to start using the platform. After that you can read more about the [platform](/platform), and the NAIS [contracts](/#contracts).


## Developer guide

* [Naisd](/dev-guide/naisd)
* [Migration](/dev-guide/migration)
* [NAV proxy](/dev-guide/nav_proxy)
* [Quick-start](/dev-guide/quickstart)
* [Service discovery](/dev-guide/service_discovery)


## Contracts

* [Alerts](/contracts/alerts)
* [Logging](/contracts/logging)
* [Metrics](/contracts/metrics)
* [NAIS manifest](/contracts/manifest)


## Services

* [Kubernetes dashboard](/dev-guide/kubernetes_dashboard)
* [Leader election](/services/leader_election)
* [Redis](/services/redis)


## Clusters

### On-premises

| Name            | Domain               | Purpose                                  |
| --------------- | -------------------- | ---------------------------------------- |
| **prod-fss**    | *.nais.adeo.no       | Production in FSS                        |
| **prod-iapp**   | *.nais-iapp.adeo.no  | Production in iApp                       |
| **prod-sbs**    | *.nais.oera.no       | Production in SBS                        |
| **preprod-fss** | *.nais.preprod.local | Non production in FSS                    |
| **preprod-sbs** | *.nais.oera-q.local  | Non production in SBS                    |
| **nais-ci**     | *.nais-ci.devillo.no | Continuous Integration for test purposes |
| **nais-dev**    | *.nais.devillo.no    | For cluster development                  |


### Google Kubernetes Engine

We are also working on setting up several clusters in [Google Kubernetes Engine](https://cloud.google.com/kubernetes-engine/).


## Web services

| Service                       | Address                   |
| ----------------------------- | ------------------------- |
| [Deploy](/dev-guide/naisd)    | `https://deploy.{domain}` |
| [Logs](/contracs/logs)        | https://logs.adeo.no      |
| [Metrics](/contracts/metrics) | https://grafana.adeo.no   |


## Contact us

Team Aura can be found either on [#nais@Slack](https://nav-it.slack.com/messages/C5KUST8N6/) or in Sannergata 2, 2nd floor, room 2201.

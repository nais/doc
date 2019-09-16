Changelog
=========

This is a simple changelog over notable milestones for the [NAIS-platform](/content/about/README.md).


## [Unreleased]
- We are rewitting Naisd to be a third-party app for Kubernetes, using the Kubernetes Operator toolset. Check out the [naiserator](https://github.com/nais/naiserator) repo for more info. It is possible to start using this now
- Implementing access policies in Naiserator, adding Istio RBAC resources and Kubernetes network policies

## [Released]

### [2019-08-19]
- Deprecated the Redis-operator, and the usage of Redis-sentinels. See [doc commit](https://github.com/nais/doc/commit/0c50a0db8a0eb7b98b77b60142e2741afba5f121#diff-4b5a6e49ad24d2fd8a9052f65eb5fc69c7fc7ecd) for more.

### [2019-08-09]
- Upgraded Kubernetes to [1.15.2](https://github.com/kubernetes/kubernetes/blob/master/CHANGELOG-1.15.md)

### [2019-08-05]
- Upgraded Kubernetes to [1.14.4](https://github.com/kubernetes/kubernetes/blob/master/CHANGELOG-1.14.md)

### [2019-07-30]
- Upgraded Kubernetes to [1.13.8](https://github.com/kubernetes/kubernetes/blob/master/CHANGELOG-1.13.md)

### [2019-06-20]
- Added NAIS deploy, enabling deployment from Github directly to our clusters. See [deployment documentation](/content/deploy/README.md) on how to use it.

### [2019-06-14]
- Hard deprecate of `spec.secrets: true`, use `spec.vault.enabled: true` instead

### [2019-06-09]
- Added support for cabundle opt-out

### [2019-04-09]
- Added support for secure logs. See [documentation](/content/logging/secure-logs.md) for more

### [2019-03-14]
- Starting [#nais-brukerforum](https://nav-it.slack.com/messages/CGGTL83GT) again. Biweekly meeting, where we talk about NAIS

### [2019 - February]
- More support for Redis as an individual instance, no more sentinels. Also support Redis-instances with passwords, see [documentation](/content/redis.md) for more
### [2019-02-18]
- Alerterator is released. A simple way to manage alerts/metrics. See [documentation](/content/alerts/README.md) for more

### [2018-12-18]
- Our Kubernetes clusters are now open through the NAV-network or VPN! Just download the lateste [kubeconfigs](https://github.com/navikt/kubeconfigs) and get started.

### [2018-12-16]
- Upgraded Kubernetes to [1.12.3](https://github.com/kubernetes/kubernetes/blob/master/CHANGELOG-1.12.md)

### [2018-12-04]
- Upgraded Kubernetes to [1.11.5](https://github.com/kubernetes/kubernetes/blob/master/CHANGELOG-1.11.md)

### [2018-10-26]
- Changed security model from everyone has read/write to read everyting and write only on team-specific resources. See [slack-message](https://nav-it.slack.com/archives/C5KUST8N6/p1540292509000100) for what to do

### [2018-09-24]
- Added Vault by Hashicorp, which is a tool to manage secrets, see [documentation](/content/secrets/README.md) for more

### [2018 - June]
- Created a new service/bot for Slack, to help team arrange stand-up. Check out [standup.nais.io](https://standup.nais.io/)

### [2018 - March]
- Added Redis operator to the platform, see [documentation](/content/redis.md) for more

### [2018 - February]
- Added option for leader election, see [documentation](/content/leader_election.md) for more

### [2018 - January]
- New service for creating ForgeRock [AM config](/content/authnz/am.md) (Norwegian) in SBS or FSS, it's called Named (NAIS Access Management Extension)

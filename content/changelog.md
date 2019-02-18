Changelog
=========

This is a simple changelog over notable milestones for the [NAIS-platform](/content/about/README.md).


## [Unreleased]
- We are rewitting Naisd to be a third-party app for Kubernetes, using the Kubernetes Operator toolset. Check out the [naiserator](https://github.com/nais/naiserator) repo for more info. It is possible to start using this now


## [Released]
### [2019-02-18]
- Alerterator is released. A simple way to manage alerts/metrics. See [documentation](https://github.com/nais/doc/blob/master/content/alerts/README.md) for more
### [2018-12-18]
- Our Kubernetes clusters are now open through the NAV-network or VPN! Just download the lateste [kubeconfigs](https://github.com/navikt/kubeconfigs) and get started.

### [2018-12-16]
- Upgraded Kubernetes to [1.12.3](https://github.com/kubernetes/kubernetes/blob/master/CHANGELOG-1.12.md)

### [2018-12-04]
- Upgraded Kubernetes to [1.11.5](https://github.com/kubernetes/kubernetes/blob/master/CHANGELOG-1.11.md)

### [2018-10-26]
- Changed security model from everyone has read/write to read everyting and write only on team-specific resources. See [slack-message](https://nav-it.slack.com/archives/C5KUST8N6/p1540292509000100) for what to do

### [2018-09-24]
- Added Vault by Hashicorp, which is a tool to manage secrets, see [documentation](/documentation/contracts/vault.md) for more

### [2018 - June]
- Created a new service/bot for Slack, to help team arrange stand-up. Check out [standup.nais.io](https://standup.nais.io/)

### [2018 - March]
- Added Redis operator to the platform, see [documentation](/documentation/services/redis.md) for more

### [2018 - February]
- Added option for leader election, see [documentation](/documentation/services/leader_election.md) for more

### [2018 - January]
- New service for creating ForgeRock [AM config](contracts/am.md) (Norwegian) in SBS or FSS, it's called Named (NAIS Access Management Extension)

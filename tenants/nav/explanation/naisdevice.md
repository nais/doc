# naisdevice

naisdevice is a mechanism provided by NAIS, that lets you connect to services not available on the public Internet from your machine.

Examples of such services are:
- Access to the NAIS cluster with kubectl
- Applications on internal domains
- Internal NAIS services such as [console](https://console.<<tenant()>>.cloud.nais.io).

In order to be able to connect, your machine needs to meet certain requirements. These requirements are enforced by a third-party service called [Kolide](https://kolide.com/) that is installed alongside naisdevice.

Kolide uses Slack to communicate with you when something is wrong with your machine, guiding you through the process of fixing it.

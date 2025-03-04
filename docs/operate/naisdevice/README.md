---
tags: [naisdevice, explanation, operate]
---

# naisdevice

naisdevice is a mechanism that lets you connect to services not available on the public internet from your machine.

Examples of such services are:

- Access to the Nais cluster with [kubectl](../how-to/command-line-access.md)
- Applications on [internal domains](../../workloads/reference/environments.md)
- Internal Nais services such as [Nais Console](../console.md).

{% if tenant() == "nav" %}

Before connecting, your machine needs to meet certain requirements. These requirements are enforced by a third-party service called [Kolide](https://kolide.com/) that is installed alongside naisdevice.

Kolide will notify you through Slack when something is wrong with your machine, and will guide you through the process of fixing it.
{% endif %}

:dart: [**Get started with naisdevice**](how-to/install.md)

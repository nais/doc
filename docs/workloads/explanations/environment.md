---
tags: [workloads, explanation]
---

# The runtime environment

Nais provides you with multiple _environments_ for you to run your [workloads](../README.md) in.
Environments are sometimes also called _clusters_.

:books: Find the full list of available environments in [the environment reference](../reference/environments.md).

## Namespaces

For each environment, your [team](../../explanations/team.md) has its own _namespace_ separate from other teams.
A namespace is a logical grouping of resources that are owned by your team.
This is where you will deploy and run your workloads.

The namespace and the resources within are only accessible to members of the owning team.

## Networking and Communication

### Zero trust

By default, all workloads are isolated from each other and the outside world according to the _zero trust_ security model.
This means that traffic to and from your workloads must be explicitly allowed.

:bulb: [Learn more about zero trust](./zero-trust.md).

### Ingresses

If you need to expose your workload to the outside world, you can do so by defining an _ingress_.

Each environment provides you with a set of domains that you can use to expose your workloads to different audiences and networks.

:bulb: [Learn more about ingresses](../application/explanations/expose.md#ingress).

### Service discovery

If your workload needs to communicate with other workloads within the same environment, you can use _service discovery_.

:bulb: [Learn more about service discovery](../application/explanations/expose.md#service-discovery).

---
tags: [workloads, how-to, service-discovery]
---

# Communicate with other workloads

Use [service discovery](../application/explanations/expose.md#service-discovery) to call another workload in the same environment.

To call a workload in another environment, use its [ingress](../application/how-to/expose.md).

## Prerequisites

- Your workload has [configured policies for outbound traffic to the target workload](access-policies.md#outbound-access).
- The target workload has [configured policies for inbound traffic from your workload](access-policies.md#inbound-access).

## Identify the target address

Find the target application's name and the team it belongs to.
Use the team name wherever the examples below show `<team-name>`.

### Call an application in your team

If both applications belong to the same team and run in the same environment, use:

```text
http://<app-name>
```

### Call an application in another team

If the target application belongs to another team in the same environment, include its team name:

```text
http://<app-name>.<team-name>
```

When you move an application to another team, update callers to use its new address and update access policies on both sides.

{% if tenant() == "nav" %}

!!! warning "Use full hostname when using webproxy on-premises"

    If your workload has [webproxy](../application/reference/spec.md#webproxy) enabled, you must use the full hostname for all service discovery calls:

    ```text
    http://<app-name>.<team-name>.svc.nais.local
    ```

    This keeps calls within the environment from going through the proxy, as the environment variable `NO_PROXY` includes `*.local`.

{% endif %}

## Call the address

Call the workload through its internal address using HTTP from your own workload:

```http
GET /resource HTTP/1.1

Host: <app-name>.<team-name>
```

---
tags: [workloads, how-to, service-discovery]
---

# Communicate with other workloads

This guide shows you how to communicate with other workloads inside the same environment or cluster via [_service discovery_](../application/explanations/expose.md#service-discovery).

## Prerequisites

- Your workload has [configured policies for _outbound traffic_ to the target workload](access-policies.md#outbound-access)
- The target workload has [configured policies for _inbound traffic_ from your workload](access-policies.md#inbound-access)

## Identify the target address

To identity the address of the workload we are communicating with, we need to know its `name` and what `namespace` its running in.

### Target exists in the same namespace

If the workload you are calling is in the same namespace, you can reach it by calling its name directly using HTTP like so:

```plaintext
http://<name>
```

### Target exists in another namespace

If the workload is running in another team's namespace, you need to specify the namespace as well:

```plaintext
http://<name>.<namespace>
```

{% if tenant() == "nav" %}

!!! warning "Use full hostname when using webproxy on-premises"

    If your workload has [webproxy](../application/reference/application-spec.md#webproxy) enabled, you must use the full hostname for all service discovery calls:

    ```text
    http://<name>.<namespace>.svc.nais.local
    ```

    This is to ensure that your workload does not attempt to perform these in-cluster calls through the proxy, as the environment variable `NO_PROXY` includes `*.local`.

{% endif %}

## Call the address

Call the workload through its internal address using HTTP from your own workload:

```http
GET /resource HTTP/1.1

Host: <name>.<namespace>
```

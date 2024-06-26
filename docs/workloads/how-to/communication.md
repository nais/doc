---
tags: [workloads, how-to]
---

# Communicate with other workloads in the same environment

This guide will show you how to communicate with other workloads inside the same environment by using _internal endpoints_ (also known as [_service discovery_](../explanations/service-discovery.md)).

## Prerequisites

- Your workload has [configured policies for _outbound traffic_ to the target workload](access-policies.md#outbound-access)
- The target workload has [configured policies for _inbound traffic_ from your workload](access-policies.md#inbound-access)

## Identify the target endpoint

To identity the endpoint of the workload we are communicating with, we need to know it's `name` and what `namespace` it's running in.

### Target exists in the same namespace

If the workload you are calling is in the same namespace, you can reach it by calling its name directly using HTTP like so:

```plaintext
http://<workload-name>
```

### Target exists in another namespace

If the workload is running in another team's namespace, you need to specify the namespace as well:

```plaintext
http://<workload-name>.<namespace>
```

{% if tenant() == "nav" %}

!!! info "Note for on-prem"
    If your workload has [webproxy](../application/reference/application-spec.md#webproxy) enabled, you should use the full hostname for all service discovery calls:

    ```text
    http://<workload-name>.<namespace>.svc.nais.local
    ```

    This is to ensure that your workload does not attempt to perform these in-cluster calls through the proxy, as the environment variable `NO_PROXY` includes `*.local`.

{% endif %}

## Call the endpoint

Call the workload using HTTP from your own workload:

```http
GET /resource HTTP/1.1

Host: <workload-name>.<namespace>
```

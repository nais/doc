---
tags: [workloads, how-to]
---

# Communicate inside the environment

This guide will show you how to communicate with other workloads inside the same environment.

## Prerequisites

- Working [access policies](access-policies.md) for the workloads you want to communicate with.

## Identify the endpoint you want to communicate with

To identity the endpoint of the workload we are communicating with, we need to know it's `name` and what `namespace` it's running in.

If the workload you are calling is in the same namespace, you can reach it by calling it's name directly using HTTP like so:

```plaintext
http://<workload-name>
```

If the workload is running in another team's namespace, you need to specify the namespace as well:

```plaintext
http://<workload-name>.<namespace>
```

With this endpoint, you can now call the workload using HTTP from your own workload.

{% if tenant() == "nav" %}

!!! info "Note for on-prem"
    If your workload has [webproxy](../application/reference/application-spec.md#webproxy) enabled, you should use the full hostname for all service discovery calls:

    ```text
    http://<workload-name>.<namespace>.svc.nais.local
    ```

    This is to ensure that your workload does not attempt to perform these in-cluster calls through the proxy, as the environment variable `NO_PROXY` includes `*.local`.

{% endif %}

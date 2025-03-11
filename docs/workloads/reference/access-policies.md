---
tags: [workloads, reference]
---

# Access policy reference

## Default allowed external hosts

The following hosts are by default accessible for every workload:

| Host / service              | Port | Protocol  |
|-----------------------------|------|-----------|
| `kube-dns`                  | 53   | UDP / TCP |
| `metadata.google.internal`  | 80   | TCP       |
| `private.googleapis.com`    | 443  | TCP       |
| `login.microsoftonline.com` | 443  | TCP       |
| `graph.microsoft.com`       | 443  | TCP       |
| `aivencloud.com`            | 443  | TCP       |

You do not need to specify these hosts in your access policies.

## Advanced: Access Kubernetes API

Kubernetes offers an API to query or manipulate the state of its objects.
For details about the Kubernetes API, see the [official documentation](https://kubernetes.io/docs/concepts/overview/kubernetes-api/).

!!! danger "Here be dragons!"

    Usage of the Kubernetes API from workloads is done at your own risk.
    This is an advanced use case that most workloads should not need.

    Nais does not offer any uptime, stability or compatibility guarantees for the API.

    If you're considering using the Kubernetes API, we recommend that you first reach out to the Nais team for guidance.

To allow outbound network access from your workload to the Kubernetes API server, you must explicitly add a label to your workload manifest:

```yaml title="app.yaml" hl_lines="7"
apiVersion: "nais.io/v1alpha1"
kind: "Application"
metadata:
  name: my-app
  namespace: my-team
  labels:
    apiserver-access: "enabled"
```

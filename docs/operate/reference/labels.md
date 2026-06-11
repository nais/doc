---
tags: [reference, operate]
---

# Label reference

Labels are user-defined key-value pairs used to organize and categorize your resources. See the [labels explanation](../explanations/labels.md) for background.

## Format

A label consists of a key and a value:

```text
labels.nais.io/<key>: <value>
```

| Part | Description |
|:-----|:------------|
| `labels.nais.io/` | Required prefix. It is the only constraint Nais adds on top of the standard Kubernetes label rules. |
| `<key>` | Your label name. Must follow the [Kubernetes label syntax](https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/#syntax-and-character-set). |
| `<value>` | Your label value. Must follow the [Kubernetes label syntax](https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/#syntax-and-character-set). |

## Behavior

- Labels are kept **verbatim** — Nais does not rewrite or strip them.
- Labels are **propagated** to the underlying Kubernetes resources that the resource owns.
- Labels carry **no special meaning** to Nais. They are only used for your own organization.

## Setting labels

Labels are defined under `metadata.labels` for any Kubernetes resource that Nais supports:

```yaml
apiVersion: nais.io/v1alpha1
kind: Application
metadata:
  name: myapplication
  namespace: myteam
  labels:
    labels.nais.io/team-area: payments
    labels.nais.io/sensitive: "true"
spec:
  ...
```

Labels can also be added and edited from [Nais Console](../console/README.md) for [Valkey](../../persistence/valkey/README.md), [OpenSearch](../../persistence/opensearch/README.md), [Config](../../services/config/README.md), and [Secret](../../services/secrets/README.md). 

## Related pages

:dart: [Add labels to your resources](../how-to/labels.md)

:bulb: [Learn more about labels](../explanations/labels.md)

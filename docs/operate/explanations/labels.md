---
tags: [explanation, operate]
---

# Labels

Labels are user-defined key-value pairs that you can attach to your resources to organize and categorize them however you make sense of them.

A label might describe ownership, a project, an environment grouping, or anything else that helps you find and group related resources. Nais does not assign any special meaning to your labels — they are yours to use as you see fit.

## How labels work on Nais

Labels on Nais are regular [Kubernetes labels](https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/) with one requirement: the key must use the `labels.nais.io/` prefix.

```text
labels.nais.io/<key>: <value>
```

This prefix keeps your own labels clearly separated from the labels that Nais manage internally, so the two never collide.

When you set a label on a resource, Nais keeps it verbatim and propagates it to the underlying Kubernetes resources that the resource owns. For a [workload](../../workloads/README.md), this means the label is also applied to the resources Nais generates on your behalf.

## Where you can use labels

You can define labels on any of the Kubernetes resources that Nais supports, under `metadata.labels`.

In addition, you can add and edit labels directly from [Nais Console](../console/README.md) for:

- [Valkey](../../persistence/valkey/README.md)
- [OpenSearch](../../persistence/opensearch/README.md)
- [Config](../../services/config/README.md)
- [Secret](../../services/secrets/README.md)

## Related pages

:dart: [Add labels to your resources](../how-to/labels.md)

:books: [Label reference](../reference/labels.md)

---
tags: [how-to, operate]
---

# Add labels to your resources

This guide shows you how to add [labels](../explanations/labels.md) to your resources, either through your manifest or through [Nais Console](../console/README.md).

## Add labels in your manifest

Add your labels under `metadata.labels`:

=== "app.yaml"

    ```yaml hl_lines="6-8"
    apiVersion: nais.io/v1alpha1
    kind: Application
    metadata:
      name: <MY-APP>
      namespace: <MY-TEAM>
      labels:
        team-area: payments
        sensitive: "true"
    spec:
      ...
    ```

The labels are kept verbatim and propagated to the Kubernetes resources that your workload owns.

## Add labels in Nais Console

You can add and edit labels from Console for [Valkey](../../persistence/valkey/README.md), [OpenSearch](../../persistence/opensearch/README.md), [Config](../../services/config/README.md), and [Secret](../../services/secrets/README.md).

1. Open [Nais Console](<<tenant_url("console")>>) and navigate to the resource you want to label.
2. Find the **Labels** section in the sidebar and click the edit icon.
3. Enter a key and a value.
4. Click **Add label** to add more labels.
5. Click **Save**.

## Related pages

:bulb: [Learn more about labels](../explanations/labels.md)

:books: [Label reference](../reference/labels.md)

---
tags: [how-to, kafka]
conditional: [not-test-nais]
---

# Create a Kafka topic

This guide will show you how to create a Kafka topic.

The fully qualified topic name is the name of the `Topic` resource prefixed with your team namespace:

```
<MY-TEAM>.<MY-TOPIC>
```

This name is also set in the `.status.fullyQualifiedName` field on your Topic resource once the Topic is synchronized to Aiven.

## Creating topics

???+ note ".nais/topic.yaml"
    ```yaml hl_lines="4-5 7 9 11-14"
    apiVersion: kafka.nais.io/v1
    kind: Topic
    metadata:
      name: <MY-TOPIC>
      namespace: <MY-TEAM>
      labels:
        team: <MY-TEAM>
    spec:
      pool: <MY-POOL>
      acl:
        - team: <MY-TEAM>
          application: <MY-APP>
          access: readwrite   # read, write, readwrite
    ```

Select a `pool` from one of the [available pools](../reference/pools.md).

See the [Kafka topic reference](../reference/kafka-topic-spec.md) for a complete list of available options.

## Grant access to the topic for other applications (optional)

See [manage access](manage-acl.md) for how to grant access to your topic.

## Apply the Topic resource

=== "Automatically"
    Add the file to your application repository to deploy with [Nais github action](../../../build/how-to/build-and-deploy.md).
=== "Manually"
    ```bash
    kubectl apply -f ./nais/topic.yaml --namespace=<MY-TEAM> --context=<MY-CLUSTER>
    ```

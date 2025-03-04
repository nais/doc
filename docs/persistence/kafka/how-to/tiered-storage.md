---
tags: [how-to, kafka, tiered-storage]
---

# How to turn on Tiered Storage for your Kafka topic

This guide shows you how to enable tiered storage for your Kafka topic.

## Prerequisites

You need to own an existing topic in nais.
Check [Create a Kafka topic](create.md) for how to create a topic.

Your topic can not use `compact` cleanup policy.

## Enable tiered storage by specifying local retention on a topic

???+ note "Git diff showing how to enable tiered storage in a 'nai example_topic.yaml' file"

    ```diff
    diff --git a/example_topic.yaml b/example_topic.yaml
    index 230ec001..cbc01774 100644
    --- a/example_topic.yaml
    +++ b/example_topic.yaml
    @@ -8,3 +8,8 @@ labels:
     spec:
     kafka:
       # ... other configuration ...
    +  config:
    +    # Must be a value smaller than `retentionHours`
    +    localRetentionHours: X
    +    # Must be a value smaller than `retentionBytes`
    +    localRetentionBytes: Y
    ```

## Apply the new configuration
=== "Automatically"
    Add the file to your application repository and deploy with [Nais github action](../../../build/how-to/build-and-deploy.md).
=== "Manually"
    ```bash
    kubectl apply -f ./example_topic.yaml --namespace=<MY-TEAM> --context=<MY-CLUSTER>
    ```

---
title: Using Kafka Streams with internal topics
tags: [how-to, kafka]
conditional: [not-test-nais]
---

# Using Kafka Streams with internal topics

<<gcp_only("Kafka Streams")>>

This guide will show you how to use [Kafka Streams](https://kafka.apache.org/documentation/streams/) with internal topics.

## Enable Kafka Streams in your application
???+ note ".nais/app.yaml"

    ```yaml hl_lines="11"
      apiVersion: nais.io/v1alpha1
      kind: Application
      metadata:
        name: <MY-APP>
        namespace: <MY-TEAM>
        labels:
          team: <MY-TEAM>
      spec:
        kafka:
          pool: <MY-POOL>
          streams: true
    ```

Select a `pool` from one of the [available pools](../reference/pools.md).

## Configure your application

When you do this you **must** configure Kafka Streams by setting the property `application.id` to a value that starts
with the value of the env var `KAFKA_STREAMS_APPLICATION_ID`, which will be injected into your pod automatically.

## Apply the application

=== "Automatically"
    Add the file to your application repository to deploy with [Nais github action](../../../build/how-to/build-and-deploy.md).
=== "Manually"
    ```bash
    kubectl apply -f ./nais/app.yaml --namespace=<MY-TEAM> --context=<MY-CLUSTER>
    ```

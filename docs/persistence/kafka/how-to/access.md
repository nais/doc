---
tags: [how-to, kafka]
---

# Accessing topics from an application

This guide shows you how to access Kafka topics from your application.

## Prerequisites

You need an existing topic to access. See [Create a Kafka topic](create.md) for how to create a topic.

## Enable access to the relevant pool in your workload definition

???+ note ".nais/app.yaml"

    ```yaml
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
    ```

Select a `pool` from one of the [available pools](../reference/pools.md).

## Grant access to the topic

The owner of the topic must [grant your application access to the topic](manage-acl.md).

## Configure your application

Aiven has written several articles on how to configure your application.
We use SSL, so ignore the SASL-SSL examples:

- [Java](https://docs.aiven.io/docs/products/kafka/howto/connect-with-java.html)
- [Python](https://docs.aiven.io/docs/products/kafka/howto/connect-with-python.html)
- [Node.js](https://docs.aiven.io/docs/products/kafka/howto/connect-with-nodejs.html)
- [Go](https://docs.aiven.io/docs/products/kafka/howto/connect-with-go.html)

For all available environment variables, see the [reference](../reference/environment-variables.md).

We recommend following the [application design guidelines](../README.md#application-design-guidelines) for how to configure your application.

## Apply the application
=== "Automatically"
    Add the file to your application repository to deploy with [NAIS github action](../../../build/how-to/build-and-deploy.md).
=== "Manually"
    ```bash
    kubectl apply -f ./nais/app.yaml --namespace=<MY-TEAM> --context=<MY-CLUSTER>
    ```

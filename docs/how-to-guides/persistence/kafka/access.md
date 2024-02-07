# Accessing topics from an application

This guide shows you how to access Kafka topics from your application.

## 0. Prerequisites

You need an existing topic to access. See [Create a Kafka topic](./create.md) for how to create a topic.

## 1. Enable access to the relevant pool in your workload definition

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
          pool: <MY-POOL> # TODO: link to available tenant pools
    ```

## 2. Grant access to the topic

The owner of the topic must [grant your application access to the topic](manage-acl.md).

## 3. Configure your application

Aiven has written several articles on how to configure your application.
We use SSL, so ignore the SASL-SSL examples:

- [Java](https://docs.aiven.io/docs/products/kafka/howto/connect-with-java.html)
- [Python](https://docs.aiven.io/docs/products/kafka/howto/connect-with-python.html)
- [Node.js](https://docs.aiven.io/docs/products/kafka/howto/connect-with-nodejs.html)
- [Go](https://docs.aiven.io/docs/products/kafka/howto/connect-with-go.html)

For all available fields and configuration options, see the [kafka reference](../../../reference/kafka.md).
We recommend following the [application design guidelines](../../../explanation/kafka.md#application-design-guidelines) for how to configure your application.

## 3. Apply the application
=== "Automatically"
    Add the file to your application repository to deploy with [NAIS github action](../../github-action.md).
=== "Manually"
    ```bash
    kubectl apply -f ./nais/app.yaml --namespace=<MY-TEAM> --context=<MY-CLUSTER>
    ```

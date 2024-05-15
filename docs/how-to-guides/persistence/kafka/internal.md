# Using Kafka Streams with internal topics
This guide will show you how to use Kafka Streams with internal topics.

## 1. Enable Kafka Streams in your application
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
          pool: <MY-POOL> # TODO: link to available tenant pools
          streams: true
    ```
## 2. Configure your application
When you do this you **must** configure Kafka Streams by setting the property `application.id` to a value that starts
with the value of the env var `KAFKA_STREAMS_APPLICATION_ID`, which will be injected into your pod automatically.

## 3. Apply the application
=== "Automatically"
    Add the file to your application repository to deploy with [NAIS github action](../../github-action.md).
=== "Manually"
    ```bash
    kubectl apply -f ./nais/app.yaml --namespace=<MY-TEAM> --context=<MY-CLUSTER>
    ```

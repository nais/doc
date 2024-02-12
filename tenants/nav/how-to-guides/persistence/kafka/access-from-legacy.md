# Accessing topics from an application outside NAIS

This guide will show you how to access a [Kafka topic](create.md) from an application outside NAIS clusters.

## 1. Enable access to the relevant pool in your [manifest](../../nais-application/application.md)

???+ note ".nais/aivenapp.yaml"

    ```yaml
    apiVersion: aiven.nais.io/v1
    kind: AivenApplication
    metadata:
      name: <MY-APP>
      namespace: <MY-TEAM>
    spec:
      kafka:
        pool: <MY-POOL> (TODO: link to available tenant pools)
      secretName: <MY-UNIQUE-SECRET-NAME>
      protected: true
    ```

!!! info
    The secretName must be a valid [DNS label](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#dns-label-names), and must be unique within the namespace.

## 2. Apply the AivenApplication
=== "Automatically"
    Add the file to your application repository, alongside `nais.yaml` to deploy with [NAIS github action](../../cicd/github-action.md).
=== "Manually"
    ```bash
    kubectl apply -f ./nais/aivenapp.yaml --namespace=<MY-TEAM> --context=<MY-ENV>
    ```

## 3. Extract the value of the generated secret
```bash
kubectl get secret <MY-UNIQUE-SECRET-NAME> --namespace <MY-TEAM> --contect <MY-ENV> -o jsonpath='{.data}' 
```

Make the values available to your application.

## 4. Grant access to the topic

The owner of the topic must [grant your application access to the topic](manage-acl.md).

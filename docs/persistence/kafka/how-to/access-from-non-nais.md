---
tags: [kafka, how-to]
conditional: [tenant, nav]
---

# Accessing topics from an application outside Nais

This guide will show you how to access a [Kafka topic](create.md) from an application outside Nais clusters.

## Enable access to the relevant pool in your manifest

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

## Apply the AivenApplication
=== "Automatically"
    Add the file to your application repository, alongside `nais.yaml` to deploy with [Nais github action](../../../build/how-to/build-and-deploy.md).
=== "Manually"
    ```bash
    kubectl apply -f ./nais/aivenapp.yaml --namespace=<MY-TEAM> --context=<MY-ENV>
    ```

## Extract the value of the generated secret
```bash
kubectl get secret <MY-UNIQUE-SECRET-NAME> --namespace <MY-TEAM> --contect <MY-ENV> -o jsonpath='{.data}' 
```

Make the values available to your application.

## Grant access to the topic

The owner of the topic must [grant your application access to the topic](manage-acl.md).

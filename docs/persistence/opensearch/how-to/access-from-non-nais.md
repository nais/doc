---
tags: [opensearch, how-to]
conditional: [tenant, nav]
---

# Accessing OpenSearch from an application outside Nais

This guide will show you how to access an [OpenSearch instance](create.md) from an application outside of supported Nais clusters.

## Enable access to the relevant instance in your manifest

???+ note ".nais/aivenapp.yaml"

    ```yaml
    apiVersion: aiven.nais.io/v1
    kind: AivenApplication
    metadata:
      name: <MY-APP>
      namespace: <MY-TEAM>
    spec:
      openSearch:
        instance: <MY-INSTANCE>
        access: read # read | readwrite | write | admin
        secretName: <MY-UNIQUE-SECRET-NAME>
      protected: true
    ```

!!! info
    The secretName must be a valid [DNS label](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#dns-label-names), and must be unique within the namespace.

!!! info
    The instance name follows the convention `opensearch-<team>-<instance>`. If you created your instance through [Nais Console](create.md), use the full name including the `opensearch-<team>-` prefix.

The `access` field defines the access level your application will have to the OpenSearch instance. See the available [access levels in the reference](../reference/README.md#access-levels).

## Apply the AivenApplication

=== "Automatically"
    Add the file to your application repository, alongside `nais.yaml` to deploy with [Nais github action](../../../build/how-to/build-and-deploy.md).
=== "Manually"
    ```bash
    kubectl apply -f ./nais/aivenapp.yaml --namespace=<MY-TEAM> --context=<MY-ENV>
    ```

## Extract the value of the generated secret

```bash
kubectl get secret <MY-UNIQUE-SECRET-NAME> --namespace <MY-TEAM> --context <MY-ENV> -o jsonpath='{.data}'
```

Make the values available to your application.

The secret contains the same environment variables as described in the [OpenSearch reference](../reference/README.md#environment-variables).

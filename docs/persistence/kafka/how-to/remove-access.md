---
tags: [how-to, kafka]
conditional: [not-test-nais]
---

# Remove access to topics from an application
This guide will show you how to remove your application's access to a Kafka topic.

## Remove ACLs from the topic
[Remove the ACL](manage-acl.md) that grants your application access to the topic.

## Remove the kafka resource from your application
???+ note ".nais/app.yaml"

    ```yaml hl_lines="9-10"
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

## Apply the application
=== "Automatically"
    Add the file to your application repository to deploy with [Nais github action](../../../build/how-to/build-and-deploy.md).
=== "Manually"
    ```bash
    kubectl apply -f ./nais/app.yaml --namespace=<MY-TEAM> --context=<MY-CLUSTER>
    ```

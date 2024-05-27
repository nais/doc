# Remove access to Kafka
This guide will show you how to remove your application's access to a Kafka topic.

## 1. Remove ACLs from the topic
[Remove the ACL](manage-acl.md) that grants your application access to the topic.

## 2. Remove the kafka resource from your application
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

## 3. Apply the application
=== "Automatically"
    Add the file to your application repository to deploy with [NAIS github action](../../github-action.md).
=== "Manually"
    ```bash
    kubectl apply -f ./nais/app.yaml --namespace=<MY-TEAM> --context=<MY-CLUSTER>
    ```

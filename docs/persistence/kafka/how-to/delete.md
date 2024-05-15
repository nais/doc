---
tags: [how-to, kafka]
---

# Delete Kafka topic and data

!!! warning
    Permanent deletes are irreversible. Enable this feature only as a step to completely remove your data.

## Enable data deletion
When a `Topic` resource is deleted from a Kubernetes cluster, the Kafka topic is still retained, and the data kept intact. If you need to remove data and start from scratch, you must add the following annotation to your `Topic` resource:

???+ note ".nais/topic.yaml"
    ```yaml hl_lines="4-6"
    apiVersion: kafka.nais.io/v1
    kind: Topic
    ...
    metadata:
      annotations:
        kafka.nais.io/removeDataWhenResourceIsDeleted: "true"
    ...
    ```
When this annotation is in place, deleting the topic resource from Kubernetes will also delete the Kafka topic and all of its data.

## Apply the Topic resource
=== "Automatically"
    Add the file to your application repository to deploy with [NAIS github action](../../../build/how-to/build-and-deploy.md).
=== "Manually"
    ```bash
    kubectl apply -f ./nais/topic.yaml --namespace=<MY-TEAM> --context=<MY-CLUSTER>
    ```


## Delete the topic resource
```bash
kubectl delete -f ./nais/topic.yaml --namespace=<MY-TEAM> --context=<MY-CLUSTER>
```



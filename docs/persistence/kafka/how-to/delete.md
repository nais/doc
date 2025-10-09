---
tags: [how-to, kafka, delete, annotate]
not-in: [test-nais]
---

# Delete Kafka topic and data

!!! warning
    Permanent deletes are irreversible. Do this only as a step to completely remove your data.

When you want to delete a Kafka topic and it's data, the `Topic` resource in Nais needs to be annotated.

## Enable data deletion

Start with annotating the `Topic` resource with `kafka.nais.io/removeDataWhenResourceIsDeleted=true` using `kubectl annotate`.

``` bash
kubectl annotate topic <TOPIC> --namespace=<MY-TEAM> --context=<MY-CLUSTER> kafka.nais.io/removeDataWhenResourceIsDeleted=true
```

When this annotation is in place, deleting the topic resource from Kubernetes will also delete the Kafka topic and all of its data.

## Delete the topic resource

```bash
kubectl delete topic <TOPIC> --namespace=<MY-TEAM> --context=<MY-CLUSTER>
```

Remember to delete the `Topic` resource from your Git repository.

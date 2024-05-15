# Create

This guide will show you how to create a Google Cloud Storage bucket.

## 0. Add the bucket to the NAIS application manifest

You create the bucket through the NAIS application manifest. 

!!!+ note "Naming"

    Bucket names must be globally unique across the entire Google infrastructure.

```yaml
apiVersion: nais.io/v1alpha1
kind: Application
metadata:
  name: <MY-APP>
...
spec:
  ...
  gcp:
    buckets:
      - name: <MY-BUCKET>
        retentionPeriodDays: 30
        lifecycleCondition:
          age: 7
          createdBefore: 2020-01-01
          numNewerVersions: 2
          withState: ANY
```

`retentionPeriodDays` and `lifecycleCondition` are for neccessary for [backup](../../../reference/bucket-backup.md).

## 1. Deploy your manifest

Deploy your manifest either using [NAIS deploy action](../../github-action.md), or manually:

```bash
kubectl apply -f <PATH-TO-MANIFEST>
```


---
tags: [how-to, bucket]
---

# Create a bucket

This guide will show you how to create a Google Cloud Storage bucket.

## Add the bucket to the NAIS application manifest

You create the bucket through the NAIS application manifest. 

!!! warning "Use a globally unique name"

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

`retentionPeriodDays` and `lifecycleCondition` are for necessary for [backup](../reference.md).

## Deploy your manifest

Deploy your manifest either using [NAIS deploy action](../../../build/how-to/build-and-deploy.md), or manually:

```bash
kubectl apply -f <PATH-TO-MANIFEST>
```


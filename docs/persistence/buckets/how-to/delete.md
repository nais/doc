---
tags: [bucket, how-to]
---
# Deleting a bucket

Delete unused buckets to avoid incurring unnecessary costs. A bucket is deleted by enabling cascading deletion, and deleting the application.

## Enable cascading/automatic deletion

For deletion of the application to automatically delete the bucket, set `cascadingDelete` to `true` in your Nais application spesification. Don't worry, the bucket won't be deleted if it contains files.

```yaml hl_lines="11"
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
        cascadingDelete: true
        retentionPeriodDays: 30
        lifecycleCondition:
          age: 7
          createdBefore: 2020-01-01
          numNewerVersions: 2
          withState: ANY
```
## Delete your application

Delete your application resource.

```bash
kubectl delete application <MY-APP>
```

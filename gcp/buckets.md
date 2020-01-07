# Cloud Storage Buckets

{% hint style="danger" %}
Cloud Storage buckets is in ALPHA and MUST NOT be used in production environments.
{% endhint %}

You can request a Google Cloud Storage bucket through the NAIS manifest. This feature is only available in GCP clusters.

{% hint style="info" %}
Bucket names must be *globally unique* across the entire Google infrastructure.
{% endhint %}

``` yaml
apiVersion: "nais.io/v1alpha1"
kind: "Application"
metadata:
  name: app-a
...
spec:
  ...
  gcp:
    buckets:
      - name: my-very-stable-and-fast-bucket
```

Once a bucket is provisioned, it *will not* be automatically deleted. This means that any cleanup must be done manually.


If having problems getting your bucket up and running, the name might be taken already. Check errors in the event log:

```bash
kubectl describe storagebucket my-very-stable-and-fast-bucket
```

An example application using workflow identity to access a bucket: [testapp](https://github.com/nais/testapp/blob/master/pkg/bucket/bucket.go)

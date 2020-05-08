# Cloud Storage Buckets

{% hint style="danger" %}
Cloud Storage buckets is in BETA. It has not been tested extensively.
{% endhint %}

You can request a Google Cloud Storage bucket through the NAIS manifest. This feature is only available in GCP clusters.


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
      - name: mybucket
```

{% hint style="tip" %}
Once a bucket is provisioned, it will not be automatically deleted unless one explicitly sets `spec.gcp.buckets[].cascadingDelete` to `true`. This means that any cleanup must be done manually.
{% endhint %}

Since bucket names must be globally unique across the entire Google infrastructure, NAIS will postfix the bucket name with a random string, and expose the generated name as an environment variable on the format `GCP_BUCKET_<NAME_PREFIX>_NAME`. Name prefix will be uppercased and `-` will be swapped with `_`. 

If having problems getting your bucket up and running, the name might be taken already. Check errors in the event log:

```bash
kubectl describe storagebucket mybucket
```

An example application using workflow identity to access a bucket: [testapp](https://github.com/nais/testapp/blob/master/pkg/bucket/bucket.go)

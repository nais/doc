# Cloud Storage Buckets

{% hint style="warning" %}
There is no automatic backup enabled for buckets.
{% endhint %}

You can request a Google Cloud Storage bucket through the NAIS manifest.

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

Bucket names must be globally unique across the entire Google infrastructure.
This can cause provisioning problems if your bucket name is used by someone else. If
you have problems getting your bucket up and running, check errors in the event log:

```bash
kubectl describe storagebucket mybucket
```

An example application using workflow identity to access a bucket: [testapp](https://github.com/nais/testapp/blob/master/pkg/bucket/bucket.go)

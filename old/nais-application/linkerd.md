# Linkerd/sidecar customizations

!!! info
    Linkerd customization is enabled for GCP clusters only.

You can tweak the Linkerd configuration by specifying certain Kubernetes annotations in your app spec.
A list of supported variables are specified in the
[Linkerd proxy configuration documentation](https://linkerd.io/2.11/reference/proxy-configuration/).

Annotations starting with`config.linkerd.io/` or `config.alpha.linkerd.io/` will be propagated to the `PodSpec`. 

## Example

```
apiVersion: nais.io/v1alpha1
kind: Application
metadata:
  name: myapplication
  namespace: myteam
  annotations:
    config.linkerd.io/proxy-memory-limit: "400M"
    config.linkerd.io/proxy-memory-request: "200M"
    config.alpha.linkerd.io/proxy-wait-before-exit-seconds: "10"
spec:
  ...
```

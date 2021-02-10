# Your first NAIS application

To run an application on NAIS, a manifest file must be created for it. This file is typically named `nais.yaml` and in this documentation it is referred to as such. Technically the manifest file can be named anything, but it is recommended to name it `nais.yaml`.

!!! info "Not thrilled by the prospect of editing yaml manually?"
    Head over to our [app starter](https://start.nais.io) to kickstart your NAIS yaml and GitHub workflow!

Such a `nais.yaml` file provides NAIS with the necessary information to run your application. If you are starting out for the first time, the minimal `nais.yaml` example below is a good starting point.

```yaml
apiVersion: "nais.io/v1alpha1"
kind: "Application"
metadata:
  name: appname
  namespace: teamname
  labels:
    team: teamname
spec:
  image: ghcr.io/navikt/imagename:tag
```

See https://github.com/features/packages for more info on how to publish packages to ghcr.io.

For more information about the `nais.yaml` specification, see [Manifest](../nais-application/nais.yaml/reference.md).

Now that you've created your application, it's time to [deploy to Kubernetes](../deployment/README.md).


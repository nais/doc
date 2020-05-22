# Your first NAIS application

To run an application on NAIS, a manifest file must be created for it. This file is typically named `nais.yaml` and in
this documentation it is referred to as such. Technically the manifest file can be named anything, but it is recommended
to name it `nais.yaml`.

Such a `nais.yaml` file provides NAIS with the necessary information to run your application. If you are starting out
for the first time, the minimal `nais.yaml` example below is a good starting point.

```yaml
apiVersion: "nais.io/v1alpha1"
kind: "Application"
metadata:
  name: appname
  namespace: default
  labels:
    team: teamname
spec:
  image: navikt/docker-image:docker-tag
```

In the example, `spec.image` points to a Docker image on [Docker Hub](https://hub.docker.com/) named `docker-image`.
If the image is pushed to some other repository, the URL must be explicitly defined. For instance, if the image exists
in GitHub's repositories, the manifest file's `spec.image` value would be
`docker.pkg.github.com/navikt/repo/docker-image:docker-tag`, and then NAIS will fetch it from there.

For more information about the `nais.yaml` specification, see [Manifest](../nais-application/manifest.md).

Now that you've created your application, it's time to [deploy to Kubernetes](../deployment/README.md).

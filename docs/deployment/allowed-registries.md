# Allowed registries

In an effort to minimize risk, we restrict the origin of Docker images to a set of known repositories.
This ensures that if we get compromised, malicious images can't be pulled directly from an arbitrary source,
but must exist at a pre-known location.

## How?
When a `Pod`, `Deployment`, `CronJob`, or `Application` resource is applied to
the cluster, the `image` tag is validated against the [list of allowed sources].
If the image is not in the list, the resource will not be created, and the user
will receive the following error message: `"application.yaml": admission
webhook "validation.gatekeeper.sh" denied the request: [denied by
allowed-registry] image 'not_allowed/image' is not in the list of allowed
sources`

## Images from unlisted registry
Re-tag the image and upload it to Docker Package Registry:

```bash
docker pull unlisted/image:tag
docker tag unlisted/image:tag docker.pkg.github.com/navikt/reponame/imagename:tag
docker push docker.pkg.github.com/navikt/reponame/imagename:tag
```

Alternatively, in special cases, submit a pull request to the [list of allowed sources] instead.

[list of allowed sources]: https://github.com/nais/image-verification/blob/main/data/valid-images.yaml

## Allowed registries

### Why?
In an effort to minimize risk, we restrict the origin of Docker images to a set of known repositories.
This ensures that if we get compromised, malicious images can't be pulled directly from an arbitrary source.

### How?
When a Pod, Deployment, CronJob or Application resource is applied to the cluster, the `image` tag is validated agains the [list of allowed sources](https://github.com/navikt/nais-yaml/tree/master/templates/constraint.yaml)
If the image is not in the list, the resource will not be created, and the user will receive the following error message:
`"application.yaml": admission webhook "validation.gatekeeper.sh" denied the request: [denied by allowed-registry] image 'not_allowed/image' is not in the list of allowed sources`

### Images from unlisted registry
Either the image source can be added to the allowed list via a [PR](https://github.com/navikt/nais-yaml/tree/master/templates/constraint.yaml), or the image can be re-tagged and uploaded to one that is already in the list, like `docker.pkg.github.com/navikt/`

#### re-tagging an image
```bash
docker pull unlisted/image:tag
docker tag unlisted/image:tag docker.pkg.github.com/navikt/reponame/imagename:tag
docker push docker.pkg.github.com/navikt/reponame/imagename:tag
```

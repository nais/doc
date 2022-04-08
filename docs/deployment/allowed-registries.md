# Allowed registries

In an effort to minimize risk, we restrict the origin of Docker images to a set of known repositories.
This ensures that if we get compromised, malicious images can't be pulled directly from an arbitrary source, but must exist at a pre-known location.

## How?
When a resource with a `image` is applied to the cluster, the `image` tag is validated against the [list of allowed sources].
If the image is not in the list, the resource will not be created, and the user will receive the following error message: 
```bash
Error from server: error when creating "pod.yaml": admission webhook "validate.kyverno.svc-fail" denied the request: 

resource Pod/nada/good-pod was blocked due to the following policies

deny-image-registries:
  validate-registries: 'validation error: Image not from an approved registry. See documentation: https://docs.nais.io/deployment/allowed-registries/ Rule
    validate-registries failed at path /spec/containers/0/image/'
```

## Images from unlisted registry
Re-tag the image and upload it to Docker Package Registry:

```bash
docker pull unlisted/image:tag
docker tag unlisted/image:tag ghcr.io/orgname/reponame/imagename:tag
docker push ghcr.io/orgname/reponame/imagename:tag
```

Alternatively, in special cases, submit a pull request to the [list of allowed sources] instead.

[list of allowed sources]: https://github.com/nais/kyverno-policies/blob/main/policies/deny-image-registries/resource-allowed-registries-cm.yaml

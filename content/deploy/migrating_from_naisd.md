# Migration from naisd to naiserator

## Converting the manifest

Your nais manifest, commonly known as `nais.yaml`, needs to be converted from its current format into the new format.

The old format looks like this:

```
image: navikt/nais-testapp
team: teamName
port: 8080
(...)
```

The new format looks like this. We also provide a complete example of a
[nais application spec](../examples/nais_example.yaml).

```
apiVersion: "nais.io/v1alpha1"
kind: "Application"
metadata:
  name: nais-testapp
  namespace: default
  labels:
    team: teamName
spec:
  image: navikt/nais-testapp:1.2.3
  team: teamName
  port: 8080
(...)
```

Follow the checklist to complete the migration:

* [ ] Use the `apiVersion`, `kind`, `metadata` and `spec` fields.
* [ ] Include the version of your Docker container in the `.spec.image` field.
* [ ] `healthcheck` is removed, and `liveness` and `readiness` has been moved to the top-level.
* [ ] The `redis` field has been removed ([#6][i6])
* [ ] The `alerts` field has been removed ([#7][i7])
* [ ] The `ingress` field has been replaced by `ingresses` and need to specified explicitly ([#14][i14])
* [ ] The `fasitResources` field has been removed ([#15][i15])

## Cluster access

Your converted manifest is a Kubernetes
[custom resource](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/),
and as such, it needs to be deployed directly to a Kubernetes cluster.
This means you need to have `kubectl` access, which in turn requires:

* [ ] [Install and configure kubectl](https://github.com/nais/doc/blob/master/documentation/dev-guide/README.md#install-kubectl)
* [ ] [Create an Azure AD group](https://github.com/navikt/IaC/tree/master/AAD%20Team) for your team, for human access to the cluster
* [ ] Request a machine (deploy) user for your CI pipeline in the #nais Slack channel.

## Deploying applications

Once everything is set up:

```
kubectl apply -f nais.yaml
```


[i6]: https://github.com/nais/naiserator/issues/6
[i7]: https://github.com/nais/naiserator/issues/7
[i14]: https://github.com/nais/naiserator/issues/14
[i15]: https://github.com/nais/naiserator/issues/15

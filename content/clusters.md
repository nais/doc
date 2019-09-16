# Clusters

We currently provide these Kubernetes clusters:

## On-prem

The name of each cluster is in the format of `<environment class>-<zone>`.

| cluster | ingresses |
| :--- | :--- |
| dev-fss | nais.preprod.local |
| prod-fss | nais.adeo.no |
| dev-sbs | nais.oera-q.no |
| prod-sbs | nais.oera.no, tjenester.nav.no |

Example: If your app is named `myapp`, then the URL for `dev-fss` would be `https://my-app.nais.preprod.local/`.

PS: Remember `https://` when calling on-prem URLs!

### Deprecation of preprod-

We are working on moving away from the `preprod-` prefix, so use `dev-` where possible. Read more about the decision over at [pig-kubernetes-ops](https://github.com/navikt/pig/blob/master/PIG-Kubernetes-OPS/adr/000-preprod-rename.md).

## Cloud/GCP

For the cloud there are no zones. Instead, we rely on a zero-trust model with a service-mesh.

| cluster | ingresses |
| :--- | :--- |
| dev-gcp | dev-adeo.no, dev-nais.no |
| prod-gcp | adeo.no |


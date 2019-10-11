# NAIS clusters

NAIS is a platform spread over two different suppliers. One set of clusters on-premise, and another set running in the
cloud \(namely [Google Cloud Platform](../gcp/README.md)\).

## On-premise

The on-premise clusters are split into two zones, _selvbetjeningsonen_ \(SBS\), _fagsystemsonen_ \(FSS\).

| cluster | ingresses | access policies enabled |
| :--- | :--- | :--- |
| dev-fss | nais.preprod.local | no |
| prod-fss | nais.adeo.no | no |
| dev-sbs | nais.oera-q.local | no |
| prod-sbs | nais.oera.no, tjenester.nav.no | no |

Example: If your app is named `myapp`, then the URL for `dev-fss` would be `https://myapp.nais.preprod.local/`.

{% hint style="info" %}
Remember `https://` when calling on-premise URLs!
{% endhint %}

{% hint style="warning" %}
We are working on moving away from the `preprod` prefix, so use `dev` where possible. Read more about the decision over
at [pig-kubernetes-ops](https://github.com/navikt/pig/blob/master/kubeops/adr/000-preprod-rename.md).
{% endhint %}

## Cloud - Google Cloud Platform \(GCP\)

For the cloud there are no zones. Instead, we rely on a [zero-trust](../gcp/zero-trust.md) model with a service-mesh.

| cluster | ingresses | access policies enabled |
| :--- | :--- | :--- |
| dev-gcp | dev-adeo.no, dev-nais.io, dev-nav.no | yes |
| prod-gcp | adeo.no, nais.io, nav.no| yes |

# NAIS

{% hint style="success", title="Feedback and Contributing" %}
**Provide feedback on the NAIS docs at the [survey](https://forms.office.com/Pages/ResponsePage.aspx?id=NGU2YsMeYkmIaZtVNSedC8kDM0IU6F5PulhQRnbQAtdUM0tONFhQQ0tVMkdMTjNOQUJHR1Y4NUEzUC4u)**

See [CONTRIBUTING](https://github.com/nais/doc/blob/master/CONTRIBUTING.md) for instructions on filing/fixing issues and adding new content.

Also, don't be afraid to use the **WAS THIS PAGE HELPFUL?** at the bottom of each page!
{% endhint %}

## What is NAIS?

NAIS is an open source application platform that aims to provide our developers with the best possible tools needed to develop and run their applications.

## Why NAIS exists

When you have a large development organisation, providing the developers with turnkey solutions for their most common needs can be a good investment.

This includes \(but not limited to\) [logging](observability/logs.md), [metrics](observability/metrics.md), [alerts](observability/alerts/README.md), [deployment](basics/deploy.md) and a [runtime environment](#nais-clusters).

Within each of these aspects, we leverage open source projects best suited for our needs and provide them with usable abstractions, sane defaults and the required security hardening.

## NAIS clusters

NAIS is a platform spread over two different suppliers. One set of clusters on-premise, and another set running in the cloud \(namely Google Cloud Platform\).

### On-premise

The on-premise clusters are split into two zones, _selvbetjeningsonen_ \(SBS\), _fagsystemsonen_ \(FSS\).

| cluster | ingresses |
| :--- | :--- |
| dev-fss | nais.preprod.local |
| prod-fss | nais.adeo.no |
| dev-sbs | nais.oera-q.local |
| prod-sbs | nais.oera.no, tjenester.nav.no |

Example: If your app is named `myapp`, then the URL for `dev-fss` would be `https://myapp.nais.preprod.local/`.

{% hint style="info" %}
Remember `https://` when calling on-premise URLs!
{% endhint %}

{% hint style="warning" %}
We are working on moving away from the `preprod` prefix, so use `dev` where possible. Read more about the decision over at [pig-kubernetes-ops](https://github.com/navikt/pig/blob/master/PIG-Kubernetes-OPS/adr/000-preprod-rename.md).
{% endhint %}

### Cloud - Google Cloud Platform \(GCP\)

For the cloud there are no zones. Instead, we rely on a zero-trust model with a service-mesh.

| cluster | ingresses |
| :--- | :--- |
| dev-gcp | dev-adeo.no, dev-nais.no |
| prod-gcp | adeo.no |

## Contact the NAIS team

The team can be found either on [Slack](https://nav-it.slack.com/messages/C5KUST8N6/) or in Sannergata 2, 3rd floor, west wing.

Also, follow us on Twitter [@nais\_io](https://twitter.com/nais_io)!


# NAIS Kubernetes clusters

NAIS currently provides the following Kubernetes clusters for developers to run their applications.

## [Google Cloud Platform](../gcp/README.md)

In the GCP we do not operate with a zone model like on-prem. Here we rely on a [zero-trust](https://github.com/navikt/pig/blob/master/kubeops/doc/zero-trust.md) model with a service-mesh.
The applications running in GCP needs [access policy rules defined](../gcp/access-policy.md) for every other service they receive requests from or sends requests to.

### Clusters

* dev-gcp 
* prod-gcp 
* labs-gcp

## On-premise

The on-premise clusters are split into two zones, _selvbetjeningsonen_ (SBS), _fagsystemsonen_ (FSS).

### Clusters

* prod-sbs
* prod-fss
* dev-sbs
* dev-fss

## Ingresses / Who can access my application

You can control from where you application is reachable by selecting the appropriate ingress domain. 

| domain | accessibility | cluster availability | certificate | description |
| ------ | ------------- | -------------------- | ----------- | ----------- |
| nais.io | naisdevice, scaleft, vdi, internal network | dev | signed by public CA. | wildcard DNS on format `*.<cluster name>.nais.io`. |
| nais.preprod.local | internal network | dev-fss | signed by NAV internal CA | wildcard DNS on format `*.nais.preprod.local`. |
| nais.oera-q.local | internal network | dev-sbs | signed by NAV internal CA | wildcard DNS on format `*.nais.oera-q.local`. |
| nais.adeo.no | internal network | prod-fss | signed by NAV internal CA | wildcard DNS on format `*.nais.adeo.no`. |
| nais.oera.no | internal network | prod-sbs | signed by NAV internal CA | wildcard DNS on format `*.nais.oera.no`. |
| tjenester.nav.no | internet | prod-sbs | signed by public CA | context root based routing on format `tjenester.nav.no/<appname>`. |
| nav.no | internet | prod-sbs, prod-gcp | signed by public CA | manually configured, contact at #nais | 
| adeo.no | internal network, case workers | prod-sbs, prod-gcp | signed by public CA | manually configured, contact at #nais | 
| dev-nav.no | internal network | dev-gcp | signed by public CA | wildcard DNS on format `*.dev-nav.no` | 
| dev-adeo.no | internal network | dev-gcp | signed by public CA | wildcard DNS on format `*.dev-adeo.no` | 

Example: If your app is named `myapp`, and you want to make it accessible for developers, then the URL for `dev-fss` would be `https://myapp.dev-fss.nais.io`.

{% hint style="warning" %}
Make sure you understand where you expose your application. Depending on the state of your application, what kind of data it exposes and how it is secured this will impact this decision.
If in doubt of what is right for your application, ask in #nais or someone on the nais team.
{% endhint %}


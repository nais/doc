# Ingress DNS setup

For most domains we point a wildcard DNS record to a loadbalancer in front of our ingress-controller.

Example:

`*.dev-gcp.nais.io -> 35.201.69.142`

This means that all entries under this domain, e.g. foo.dev-gcp.nais.io, will resolve to this address automatically.

## Shared domains

When domains are shared between clusters, such as dev.nav.no which exists both in dev-gcp and dev-sbs, we have a wildcard entry pointing to dev-gcp. In addition, to be able to use the same domain in dev-sbs, we have to create explicit records in DNS to be able to direct the traffic to another cluster.

These records are automatically created based on the ingresses defined in the cluster. 

{% hint style="warning" %}
You cannot have a application using the same ingress in both clusters, as the explicit record created will always override the wildcard ingress. 
{% endhint %}

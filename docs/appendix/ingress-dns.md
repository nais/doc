# Ingress DNS setup

For most domains we point a wildcard DNS record to a loadbalancer in front of our ingress-controller.

Example:

`*.dev-gcp.nais.io -> 35.201.69.142`

This means that all entries under this domain, e.g. foo.dev-gcp.nais.io, will resolve to this address automatically.



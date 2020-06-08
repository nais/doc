# On-premise clusters

The on-premise Kubernetes clusters are split across two zones and two environments:

| cluster | zone | environment |
| ------- | ---- | ----------- |
| `dev-fss` | fagsystemsonen | development |
| `dev-sbs` | selvbetjeningssonen | development |
| `prod-fss` | fagsystemsonen | production |
| `prod-sbs` | selvbetjeningssonen | production |

## Accessing the application

Access is controlled in part by ingresses, which define where your application will be exposed as a HTTP endpoint.
You can control where your application is reachable from by selecting the appropriate ingress domain. 

{% hint style="warning" %}
Make sure you understand where you expose your application, taking into account
the state of your application, what kind of data it exposes and how it is
secured. If in doubt, ask in #nais or someone on the NAIS team.
{% endhint %}

You can control from where you application is reachable by selecting the appropriate ingress domain. 

| domain | accessibility | cluster availability | certificate | description |
| ------ | ------------- | -------------------- | ----------- | ----------- |
| nais.io | naisdevice, navtunnel, vdi, internal network | dev | signed by public CA. | wildcard DNS on format `*.<cluster name>.nais.io`. |
| nais.preprod.local | internal network | dev-fss | signed by NAV internal CA | wildcard DNS on format `*.nais.preprod.local`. |
| nais.oera-q.local | internal network | dev-sbs | signed by NAV internal CA | wildcard DNS on format `*.nais.oera-q.local`. |
| nais.adeo.no | internal network | prod-fss | signed by NAV internal CA | wildcard DNS on format `*.nais.adeo.no`. |
| nais.oera.no | internal network | prod-sbs | signed by NAV internal CA | wildcard DNS on format `*.nais.oera.no`. |
| tjenester.nav.no | internet | prod-sbs | signed by public CA | context root based routing on format `tjenester.nav.no/<appname>`. |
| nav.no | internet | prod-sbs, prod-gcp | signed by public CA | manually configured, contact at #nais | 
| adeo.no | internal network, case workers | prod-sbs, prod-gcp | signed by public CA | manually configured, contact at #nais | 

Example: If your app is named `myapp`, and you want to make it accessible for developers, then the URL for `dev-fss` would be `https://myapp.dev-fss.nais.io`.

# Available environments

This is a overview over the different environments and available domains.

We also enumerate the external IPs used by the environments, so that you can provide them to services that require IP allow-listing.

### staging

#### Domains

| domain | accessible from | description |
| :--- | :--- | :--- |
| external.staging.ssb.cloud.nais.io | internet | ingress for applications exposed to internet. URLs containing `/metrics`, `/actuator` or `/internal` are blocked. |
| staging.ssb.cloud.nais.io | [naisdevice](../explanation/naisdevice.md) | ingress for internal applications |

#### External/outbound IPs

- 34.88.116.202

### prod

#### Domains

| domain | accessible from | description |
| :--- | :--- | :--- |
| external.prod.ssb.cloud.nais.io | internet | ingress for applications exposed to internet. URLs containing `/metrics`, `/actuator` or `/internal` are blocked. |
| prod.ssb.cloud.nais.io | [naisdevice](../explanation/naisdevice.md) | ingress for internal applications |

#### External/outbound IPs

- 34.88.47.40

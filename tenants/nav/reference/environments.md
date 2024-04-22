# Environments

NAIS provides environments both on-prem and running in Google Cloud Platform (GCP).

This is a overview over the different environments and their available domains.

We also enumerate the external IPs used by the environments, so that you can provide them to services that require IP allow-listing.

## Google Cloud Platform (GCP)

### dev-gcp

#### Ingress domains

| domain | accessible from | 
| :--- | :--- |
| ekstern.dev.nav.no | Internet | 
| intern.dev.nav.no  | NAV internal networks (including [naisdevice](../explanation/naisdevice.md))| 
| ansatt.dev.nav.no  | Internet, but only accessible by authenticated humans on compliant devices | 

See [explanation for exposing application](../explanation/exposing-application.md) for more information.

#### External IPs

- 35.228.4.248
- 34.88.219.93
- 35.228.165.176

### prod-gcp

#### Ingress domains

| domain | accessible from |
| :--- | :--- |
| nav.no | Internet |
| intern.nav.no  | NAV internal networks (including [naisdevice](../explanation/naisdevice.md))| 
| ansatt.nav.no  | Internet, but only accessible by authenticated humans on compliant devices | 

See [explanation for exposing application](../explanation/exposing-application.md) for more information.

#### External IPs

- 35.228.235.189
- 35.228.12.134
- 35.228.189.194


## On-prem

!!! warning

    This is a legacy environment, and is not recommended for new workloads. 

### dev-fss

#### Ingress domains

| domain              | accessible from                   | description                                                                                                                                                                       |
| :------------------ | :-------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| intern.dev.nav.no   | [naisdevice](../explanation/naisdevice.md) | development ingress for internal applications. Also available in dev-gcp, use this to ease migration                                                                              |
| dev-fss-pub.nais.io | GCP                               | See [How do I reach an application found on-premises from my application in GCP?](../explanation/migrating-to-gcp.md#how-do-i-reach-an-application-found-on-premises-from-my-application-in-gcp) |

### prod-fss

#### Ingress domains

| domain               | accessible from                   | description                                                                                                                                                                       |
| :------------------- | :-------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| intern.nav.no        | [naisdevice](../explanation/naisdevice.md) | ingress for internal applications (supersedes nais.adeo.no). Also available in prod-gcp, use this to ease migration. Requires [JITA](./naisdevice/jita.md) to `onprem-k8s-prod`      |
| prod-fss-pub.nais.io | GCP                               | See [How do I reach an application found on-premises from my application in GCP?](../explanation/migrating-to-gcp.md#how-do-i-reach-an-application-found-on-premises-from-my-application-in-gcp) |

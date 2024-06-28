---
description: How to show Grafana on an infoscreen
tags: [how-to, metrics, grafana]
conditional: [tenant, nav]
---
# Show Grafana on infoscreen

To access Grafana from an infoscreen, some additional steps are required.

## Create service account token

1. Find your team's service account in [Grafana](https://grafana.<<tenant()>>.cloud.nais.io/org/serviceaccounts).
1. Click on `Add token`, and set the desired expiration.
1. Copy the token value, and use in the following step.

## Access Grafana from infoscreen browser

To add the service account credentials to the header of your requests, you can use the [Modify Header Value](https://mybrowseraddon.com/modify-header-value.html) browser extension available for Chrome and Firefox.

Set the following configuration in the extension:

| Field        | Value                                                     |
| ------------ | --------------------------------------------------------- |
| URL          | `https://grafana-infoskjerm.<<tenant()>>.cloud.nais.io/*` |
| Domain       | ✅                                                         |
| Header name  | `Authorization`                                           |
| Add          | ✅                                                         |
| Header value | `Bearer <service-account-token>`                          |
| State        | Active                                                    |


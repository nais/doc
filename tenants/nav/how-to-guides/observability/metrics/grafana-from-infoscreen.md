---
description: How to show Grafana on an info-screen
tags: [guide, grafana]
---
# Show Grafana on info-screen

This how-to shows you how to show Grafana on a info-screen.

## 1. Get service account

In order to run Grafana from a big screen, you will need a Grafana service account.

You get this by contacting us in the [#nais](https://nav-it.slack.com/archives/C5KUST8N6) channel on Slack.

## 2. Access Grafana

=== "using browser extension"
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

=== "using token manually"

    Access `https://grafana-infoskjerm.<<tenant()>>.cloud.nais.io` with the sevice account credential as a Bearer token:

    ```code
    Authorization: Bearer <service-account-token>
    ```

    !!! note

        Maske sure you spell the `Authorization` header name correctly and that the value `Bearer` starts with a capital B followed by the token. Replace `<service-account-token>` with your service account token value. If done incorrectly Grafana will reload constantly.

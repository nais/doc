---
description: How to show Grafana on an infoscreen
tags: [how-to, metrics, grafana, infoskjerm]
conditional: [tenant, nav]
---
# Show Grafana on infoscreen

To access Grafana from an infoscreen, some additional steps are required.

## Create service account token

1. Find your team's service account in [Grafana](https://grafana.<<tenant()>>.cloud.nais.io/org/serviceaccounts).
1. Click on `Add token`, and set the desired expiration.
1. Copy the token value, and use in the following step.

## Access Grafana from infoscreen browser

To add the service account credentials to the header of your requests, you can use the Simple Modify Header browser extension available for both [Chrome](https://chromewebstore.google.com/detail/simple-modify-headers/gjgiipmpldkpbdfjkgofildhapegmmic) and [Firefox](https://addons.mozilla.org/nb-NO/firefox/addon/simple-modify-header/).

Set the following configuration in the extension:

| Field              | Value                                                     |
|--------------------|-----------------------------------------------------------|
| Url Patterns       | `https://grafana-infoskjerm.<<tenant()>>.cloud.nais.io/*` |
| Action             | Add                                                       |
| Header Field Name  | `Authorization`                                           |
| Header Field Value | `Bearer <service-account-token>`                          |
| Apply on           | Request                                                   |
| Status             | ON ✅                                                     |

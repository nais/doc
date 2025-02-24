---
tags: [entra-id, azure-ad, how-to]
conditional: [tenant, nav]
---

# Consume internal API as an application

This how-to guides you through the steps required to consume an API secured with [Entra ID](../README.md) as an application (or a machine user).
This is also known as the _machine-to-machine (M2M)_ or _client credentials_ flow.

## Prerequisites

- The API you're consuming has [granted access to your application](secure.md#grant-access-to-consumers)

## Configure your application

Enable Entra ID in your application:

```yaml title="app.yaml"
spec:
  azure:
    application:
      enabled: true
```

Depending on how you communicate with the API you're consuming, [configure the appropriate outbound access policies](../../../workloads/how-to/access-policies.md#outbound-access).

## Acquire token

Now you can request a new token for the API that you want to consume.

{% set identity_provider = 'azuread' %}
{% set target = 'api://<cluster>.<namespace>.<other-api-app-name>/.default' %}
{% set target_description = 'The intended _audience_ (target API or recipient) of the new token.' %}
{% include 'auth/partials/token.md' %}

## Consume API

Once you have acquired a new token, you can finally consume the target API by using the token as a [Bearer token](../../explanations/README.md#bearer-token):

```http
GET /resource HTTP/1.1

Host: api.example.com
Authorization: Bearer eyJraWQ...
```

## Related pages

:books: [Entra ID reference](../reference/README.md)

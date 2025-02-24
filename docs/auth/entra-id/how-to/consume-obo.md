---
tags: [entra-id, azure-ad, how-to]
conditional: [tenant, nav]
---

# Consume internal API on behalf of an employee

This how-to guides you through the steps required to consume an API secured with [Entra ID](../README.md) on behalf of an employee.
This is also known as the _on-behalf-of (OBO)_ flow.

## Prerequisites

- Your application receives requests with an employee subject token in the `Authorization` header. The application is either:
    - [a backend API secured with Entra ID](secure.md), or
    - [a backend-for-frontend that logs in employees](login.md)
- The API you're consuming has [granted access to your application and employees](secure.md#grant-access-to-consumers)

## Configure your application

Depending on how you communicate with the API you're consuming, [configure the appropriate outbound access policies](../../../workloads/how-to/access-policies.md#outbound-access).

## Exchange token

Now you can exchange the employee's subject token for a new token, targeting the API that you want to consume.

{% set identity_provider = 'azuread' %}
{% set target = 'api://<cluster>.<namespace>.<other-api-app-name>/.default' %}
{% include 'auth/partials/token-exchange.md' %}

## Consume API

Once you have acquired a new token, you can finally consume the target API by using the token as a [Bearer token](../../explanations/README.md#bearer-token):

```http
GET /resource HTTP/1.1

Host: api.example.com
Authorization: Bearer eyJraWQ...
```

## Related pages

:books: [Entra ID reference](../reference/README.md)

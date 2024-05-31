---
tags: [entra-id, azure-ad, how-to]
---

# Consume internal API on behalf of an employee

This how-to guides you through the steps required to consume an API secured with [Entra ID](../README.md) on behalf of an employee:

1. [Configure your application](#configure-your-application)
2. [Acquire token from Entra ID](#acquire-token)
3. [Consume the API using the token](#consume-api)

## Prerequisites

- Your application is [secured with Entra ID](secure.md) and receives requests with an employee subject token
- The API you're consuming has [granted access to your application and employees](secure.md#grant-access-to-consumers)

## Configure your application

Depending on how you communicate with the API you're consuming, [configure the appropriate outbound access policies](../../../workloads/how-to/access-policies.md).

{%- if tenant() == "nav" %}
???+ warning "Use webproxy for outbound network connectivity from on-premises environments"

    If you're on-premises, you must enable and use [`webproxy`](../../../workloads/application/reference/application-spec.md#webproxy) to access Entra ID.

{%- endif %}

## Acquire token

Exchange the employees subject token for a new token targeting the API that you want to consume:

```http title="Token request"
POST ${AZURE_OPENID_CONFIG_TOKEN_ENDPOINT} HTTP/1.1
Content-Type: application/x-www-form-urlencoded

grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer
&client_id=${AZURE_APP_CLIENT_ID}
&client_secret=${AZURE_APP_CLIENT_SECRET}
&assertion=<subject_token>
&scope=api://<cluster>.<namespace>.<other-api-app-name>/.default
&requested_token_use=on_behalf_of
```

```json title="Successful response"
{
  "access_token" : "eyJ0eX[...]",
  "expires_in" : 3599,
  ...
}
```

Your application does not need to validate this token.

!!! tip "Token Caching"

      The `expires_in` field denotes the lifetime of the token in seconds.

      **Cache and reuse the token until it expires** to minimize network latency impact.

      A safe cache key for client credentials tokens is `key = sha256($subject_token + $scope)`.

## Consume API

Once you have acquired the token, you can finally consume the target API.

Use the token in the `Authorization` header as a [Bearer token](../../explanations/README.md#bearer-token):

```http
GET /resource HTTP/1.1

Host: api.example.com
Authorization: Bearer eyJraWQ...
```

## Related pages

:books: [Entra ID reference](../reference/README.md)


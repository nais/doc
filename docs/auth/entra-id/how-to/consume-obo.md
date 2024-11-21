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

Depending on how you communicate with the API you're consuming, [configure the appropriate outbound access policies](../../../workloads/how-to/access-policies.md).

{%- if tenant() == "nav" %}
???+ warning "Use webproxy for outbound network connectivity from on-premises environments"

    If you're on-premises, you must enable and use [`webproxy`](../../../workloads/application/reference/application-spec.md#webproxy) to access Entra ID.

{%- endif %}

## Acquire token
Now you can exchange the employees subject token for a new token targeting the API that you want to consume.

### Automatically with Texas

???+ warning "Token Exchange as a Service (Texas) is in public beta."

    To enable for your application, set the `texas.nais.io=enabled` annotation on your `Application`.

<<gcp_only("Texas")>>

Texas is [Token Exchange as a Service](../../explanations/README.md#texas), aimed to make it easier to deal with tokens.

Send a HTTP POST request to the endpoint described in the `$NAIS_TOKEN_EXCHANGE_ENDPOINT` environment variable.
The value for `target` is the identifier for the application you wish to make calls to.
Set `user_token` to the user's access token.

```json
{
    "identity_provider": "azuread",
    "target": "cluster:namespace:application",
    "user_token": "eyJra..."
}
```

You will get a response with an access token. The token can be used to access APIs on behalf of the user, for your specified target only.
```json
{
    "access_token": "eyJra...",
    "expires_in": 3599,
    "token_type": "Bearer"
}
```

### Manually
The token request is an HTTP POST request.
It must have the `Content-Type` header set to `application/x-www-form-urlencoded`.

The body of the request should contain the following parameters:

| Parameter             | Value                                                       | Description                                                                                                     |
|:----------------------|:------------------------------------------------------------|:----------------------------------------------------------------------------------------------------------------|
| `assertion`           | `eyJraWQ...`                                                | The employee's subject token from the inbound request. Token that should be exchanged.                          |
| `client_id`           | `60dea49a-255b-48b5-b0c0-0974ac1c0b53`                      | Client identifier for your application. Set to the [`AZURE_APP_CLIENT_ID` environment variable][variables-ref]. |
| `client_secret`       | `<some-secret>`                                             | Client secret for your application. Set to the [`AZURE_APP_CLIENT_SECRET` environment variable][variables-ref]. |
| `grant_type`          | `urn:ietf:params:oauth:grant-type:jwt-bearer`               | Always `urn:ietf:params:oauth:grant-type:jwt-bearer`.                                                           |
| `requested_token_use` | `on_behalf_of`                                              | Always `on_behalf_of`.                                                                                          |
| `scope`               | `api://<cluster>.<namespace>.<other-api-app-name>/.default` | The intended _audience_ (target API or recipient) of the new token.                                             |

[variables-ref]: ../reference/README.md#variables-for-acquiring-tokens

Send the request to the `token_endpoint`, i.e. the URL found in the [`AZURE_OPENID_CONFIG_TOKEN_ENDPOINT`][variables-ref] environment variable:

```http title="Token request"
POST ${AZURE_OPENID_CONFIG_TOKEN_ENDPOINT} HTTP/1.1
Content-Type: application/x-www-form-urlencoded

assertion=<subject_token>&
client_id=${AZURE_APP_CLIENT_ID}&
client_secret=${AZURE_APP_CLIENT_SECRET}&
grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&
requested_token_use=on_behalf_of&
scope=api://<cluster>.<namespace>.<other-api-app-name>/.default
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

      A safe cache key for this flow is `key = sha256($subject_token + $scope)`.

## Consume API

Once you have acquired a new token, you can finally consume the target API by using the token as a [Bearer token](../../explanations/README.md#bearer-token):

```http
GET /resource HTTP/1.1

Host: api.example.com
Authorization: Bearer eyJraWQ...
```

## Related pages

:books: [Entra ID reference](../reference/README.md)

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

Depending on how you communicate with the API you're consuming, [configure the appropriate outbound access policies](../../../workloads/how-to/access-policies.md).

{%- if tenant() == "nav" %}
???+ warning "Use webproxy for outbound network connectivity from on-premises environments"

    If you're on-premises, you must enable and use [`webproxy`](../../../workloads/application/reference/application-spec.md#webproxy) to access Entra ID.

{%- endif %}

## Acquire token
Now you can request a new token for the API that you want to consume.

### Automatically with Texas

???+ warning "[Token Exchange as a Service](../../explanations/README.md#texas) (Texas) is in public beta."

    To enable for your application, set the `texas.nais.io/enabled: "true"` annotation on your `Application`.

Send a HTTP POST request to the endpoint described in the `$NAIS_TOKEN_ENDPOINT` environment variable.
The value for `target` is the identifier for the application you wish to make calls to.

```json
{
    "identity_provider": "azuread",
    "target": "api://<cluster>:<namespace>:<application>/.default"
}
```

You will get a response with an access token. The token can be used to access APIs for your specified target only.

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

| Parameter       | Value                                                       | Description                                                                                                     |
|:----------------|:------------------------------------------------------------|:----------------------------------------------------------------------------------------------------------------|
| `client_id`     | `60dea49a-255b-48b5-b0c0-0974ac1c0b53`                      | Client identifier for your application. Set to the [`AZURE_APP_CLIENT_ID` environment variable][variables-ref]. |
| `client_secret` | `<some-secret>`                                             | Client secret for your application. Set to the [`AZURE_APP_CLIENT_SECRET` environment variable][variables-ref]. |
| `grant_type`    | `client_credentials`                                        | Always `client_credentials`.                                                                                    |
| `scope`         | `api://<cluster>.<namespace>.<other-api-app-name>/.default` | The intended _audience_ (target API or recipient) of the new token.                                             |

[variables-ref]: ../reference/README.md#variables-for-acquiring-tokens

Send the request to the `token_endpoint`, i.e. the URL found in the [`AZURE_OPENID_CONFIG_TOKEN_ENDPOINT`][variables-ref] environment variable:

```http title="Token request"
POST ${AZURE_OPENID_CONFIG_TOKEN_ENDPOINT} HTTP/1.1
Content-Type: application/x-www-form-urlencoded

client_id=${AZURE_APP_CLIENT_ID]&
client_secret=${AZURE_APP_CLIENT_SECRET}&
grant_type=client_credentials&
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

      A safe cache key for this flow is `key = $scope`.

## Consume API

Once you have acquired a new token, you can finally consume the target API by using the token as a [Bearer token](../../explanations/README.md#bearer-token):

```http
GET /resource HTTP/1.1

Host: api.example.com
Authorization: Bearer eyJraWQ...
```

## Related pages

:books: [Entra ID reference](../reference/README.md)

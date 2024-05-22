---
tags: [tokenx, how-to]
---

# Consume API using TokenX

This how-to guides you through the steps required to consume an API secured with [TokenX](../README.md):

1. [Configure your application](#configure-your-application)
1. [Authenticate with TokenX](#authenticate-with-tokenx)
1. [Exchange token](#exchange-token)
1. [Consume the API using the token](#consume-api)

## Prerequisites

- The API you're consuming has [granted access to your application](secure.md#grant-access)

## Configure your application

- Enable TokenX in your application:

    ```yaml title="app.yaml"
    spec:
      tokenx:
        enabled: true
    ```

- Depending on how you communicate with the API you're consuming, [configure the appropriate outbound access policies](../../../workloads/how-to/access-policies.md).

## Authenticate with TokenX

To perform a token exchange, your application must authenticate itself.
To do so, create a [client assertion](../../explanations/README.md#client-assertion).

The client assertion is signed with your applications [private key](../../explanations/README.md#private-keys) contained within [`TOKEN_X_PRIVATE_JWK`][variables-ref].

The assertion must contain the following claims:

| Claim     | Example Value                                    | Description                                                                                                     |
|:----------|:-------------------------------------------------|:----------------------------------------------------------------------------------------------------------------|
| **`sub`** | `dev-gcp:my-team:app-a`                          | The _subject_ of the token. Set to [`TOKEN_X_CLIENT_ID`][variables-ref].                                        |
| **`iss`** | `dev-gcp:my-team:app-a`                          | The _issuer_ of the token. Set to [`TOKEN_X_CLIENT_ID`][variables-ref].                                         |
| **`aud`** | `https://tokenx.dev-gcp.nav.cloud.nais.io/token` | The _audience_ of the token. Set to [`TOKEN_X_TOKEN_ENDPOINT`][variables-ref].                                  |
| **`jti`** | `83c580a6-b479-426d-876b-267aa9848e2f`           | The _JWT ID_ of the token. Used to uniquely identify a token. Set this to a UUID or similar.                    |
| **`nbf`** | `1597783152`                                     | `nbf` stands for _not before_. Set to now.                                                                      |
| **`iat`** | `1597783152`                                     | `iat` stands for _issued at_. Set to now.                                                                       |
| **`exp`** | `1597783182`                                     | `exp` is the _expiration time_ of the token. Between 1 and 120 seconds after now. Typically 30 seconds is fine. |

Additionally, the headers of the assertion must contain the following parameters:

| Parameter | Value                                  | Description                                                                                                                                        |
|:----------|:---------------------------------------|:---------------------------------------------------------------------------------------------------------------------------------------------------|
| **`kid`** | `93ad09a5-70bc-4858-bd26-5ff4a0c5f73f` | The key identifier of the key used to sign the assertion. This identifier is available in the JWK found in [`TOKEN_X_PRIVATE_JWK`][variables-ref]. |
| **`typ`** | `JWT`                                  | Represents the type of this JWT. Set this to `JWT`.                                                                                                |
| **`alg`** | `RS256`                                | Represents the cryptographic algorithm used to secure the JWT. Set this to `RS256`.                                                                |

??? example "Example Client Assertion Values"

    ```json title="Header"
    {
      "kid": "93ad09a5-70bc-4858-bd26-5ff4a0c5f73f",
      "typ": "JWT",
      "alg": "RS256"
    }
    ```

    ```json title="Payload"
    {
      "sub": "prod-gcp:namespace-gcp:gcp-app",
      "aud": "https://tokenx.dev-gcp.nav.cloud.nais.io/token",
      "nbf": 1592508050,
      "iss": "prod-gcp:namespace-gcp:gcp-app",
      "exp": 1592508171,
      "iat": 1592508050,
      "jti": "fd9717d3-6889-4b22-89b8-2626332abf14"
    }
    ```

## Exchange token

Now that you have a client assertion, we can use this to exchange the inbound token you received from your consumer.

### Create exchange request

Create a POST request with the following required parameters:

| Parameter               | Value                                                    | Comment                                                                                                          |
|:------------------------|:---------------------------------------------------------|:-----------------------------------------------------------------------------------------------------------------|
| `grant_type`            | `urn:ietf:params:oauth:grant-type:token-exchange`        |                                                                                                                  |
| `client_assertion_type` | `urn:ietf:params:oauth:client-assertion-type:jwt-bearer` |                                                                                                                  |
| `client_assertion`      | A serialized JWT identifying the calling app             | The [client assertion](#authenticate-with-tokenx)                                                                |                                                                                                                  |
| `subject_token_type`    | `urn:ietf:params:oauth:token-type:jwt`                   |                                                                                                                  |
| `subject_token`         | A serialized JWT, the token that should be exchanged     | Inbound citizen token, either from ID-porten or TokenX                                                           |
| `audience`              | The identifier of the app you wish to use the token for  | The target application using the naming scheme `<cluster>:<namespace>:<appname>` e.g. `prod-gcp:namespace1:app1` |

Send the request to the `token_endpoint`, i.e. [`TOKEN_X_TOKEN_ENDPOINT`][variables-ref].

```http title="Example exchange request"
POST /token HTTP/1.1
Host: tokenx.prod-gcp.nav.cloud.nais.io
Content-Type: application/x-www-form-urlencoded

grant_type=urn:ietf:params:oauth:grant-type:token-exchange&
client_assertion_type=urn:ietf:params:oauth:client-assertion-type:jwt-bearer&
client_assertion=eY...............&
subject_token_type=urn:ietf:params:oauth:token-type:jwt&
subject_token=eY...............&
audience=prod-gcp:namespace1:app1
```

### Exchange response

The response is a JSON object

```json title="Exchange Response"
{
  "access_token" : "eyJraWQiOi..............",
  "issued_token_type" : "urn:ietf:params:oauth:token-type:access_token",
  "token_type" : "Bearer",
  "expires_in" : 899
}
```

???+ note "Cache your tokens"

    The `expires_in` field in the response indicates the lifetime of the token in seconds.

    Use this field to cache and reuse the token to minimize network latency impact.

    A safe cache key is `key = sha256($subject_token + $audience)`.

### Exchange error response

If the exchange request is invalid, you will receive a structured error, as specified in 
[RFC 8693, Section 2.2.2](https://www.rfc-editor.org/rfc/rfc8693.html#name-error-response):

```json title="Error response"
{
  "error_description" : "token exchange audience <some-audience> is invalid",
  "error" : "invalid_request"
}
```

## Consume API

Once you have acquired the token, you can finally consume the external API.

Use the token in the `Authorization` header as a [Bearer token](../../explanations/README.md#bearer-token):

```http
GET /resource HTTP/1.1

Host: api.example.com
Authorization: Bearer eyJraWQ...
```

[variables-ref]: ../reference/README.md#variables-for-acquiring-tokens

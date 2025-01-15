---
tags: [tokenx, how-to]
conditional: [tenant, nav]
---

# Consume internal API on behalf of a citizen

This how-to guides you through the steps required to consume an API secured with [TokenX](../README.md):

## Prerequisites

- Your application receives requests with a citizen subject token in the `Authorization` header
    - The subject token can either be from [ID-porten](../../idporten/README.md) or from TokenX itself
- The API you're consuming has [granted access to your application](secure.md#grant-access-to-consumers)

## Configure your application

Enable TokenX in your application:

```yaml title="app.yaml"
spec:
  tokenx:
    enabled: true
```

Depending on how you communicate with the API you're consuming, [configure the appropriate outbound access policies](../../../workloads/how-to/access-policies.md#outbound-access).

## Exchange token

To exchange a token, you can either:

- [exchange tokens with Texas](#exchange-tokens-with-texas), or
- [exchange tokens manually](#exchange-tokens-manually) in your application

### Exchange tokens with Texas

{% set identity_provider = 'tokenx' %}
{% set target = '<cluster>:<namespace>:<other-app-name>' %}
{% include 'auth/partials/token-exchange.md' %}

### Exchange tokens manually

#### Create client assertion

To perform a token exchange, your application must authenticate itself.
To do so, create a [client assertion](../../explanations/README.md#client-assertion).

Sign the client assertion with your applications [private key](../../explanations/README.md#private-keys) contained within the [`TOKEN_X_PRIVATE_JWK`][variables-ref] environment variable.

The assertion must contain the following claims:

| Claim     | Example Value                                    | Description                                                                                                     |
|:----------|:-------------------------------------------------|:----------------------------------------------------------------------------------------------------------------|
| **`sub`** | `dev-gcp:my-team:app-a`                          | The _subject_ of the token. Set to the [`TOKEN_X_CLIENT_ID` environment variable][variables-ref].               |
| **`iss`** | `dev-gcp:my-team:app-a`                          | The _issuer_ of the token. Set to the [`TOKEN_X_CLIENT_ID` environment variable][variables-ref].                |
| **`aud`** | `https://tokenx.dev-gcp.nav.cloud.nais.io/token` | The _audience_ of the token. Set to the [`TOKEN_X_TOKEN_ENDPOINT` environment variable][variables-ref].         |
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

#### Create and perform exchange request

Now that you have a client assertion, we can use this to exchange the inbound token you received from your consumer.

The token request is an HTTP POST request.
It must have the `Content-Type` header set to `application/x-www-form-urlencoded`

The body of the request should contain the following parameters:

| Parameter               | Value                                                    | Description                                                                                                                          |
|:------------------------|:---------------------------------------------------------|:-------------------------------------------------------------------------------------------------------------------------------------|
| `grant_type`            | `urn:ietf:params:oauth:grant-type:token-exchange`        | Always `urn:ietf:params:oauth:grant-type:token-exchange`.                                                                            |
| `client_assertion_type` | `urn:ietf:params:oauth:client-assertion-type:jwt-bearer` | Always `urn:ietf:params:oauth:client-assertion-type:jwt-bearer`.                                                                     |
| `client_assertion`      | `eyJraWQ...`                                             | The [client assertion](#create-client-assertion). Token that authenticates your application. It should be unique and only used once. |                                                                                                                  |
| `subject_token_type`    | `urn:ietf:params:oauth:token-type:jwt`                   | Always `urn:ietf:params:oauth:token-type:jwt`.                                                                                       |
| `subject_token`         | `eyJraWQ...`                                             | The citizen's subject token from the inbound request, either from ID-porten or TokenX. Token that should be exchanged.               |
| `audience`              | `<cluster>:<namespace>:<appname>`                        | The identifier for the target application. Intended audience or recipient of the new token.                                          |

Send the request to the `token_endpoint`, i.e. the URL found in the [`TOKEN_X_TOKEN_ENDPOINT`][variables-ref] environment variable.

```http title="Example request"
POST ${TOKEN_X_TOKEN_ENDPOINT} HTTP/1.1
Content-Type: application/x-www-form-urlencoded

grant_type=urn:ietf:params:oauth:grant-type:token-exchange&
client_assertion_type=urn:ietf:params:oauth:client-assertion-type:jwt-bearer&
client_assertion=eY...............&
subject_token_type=urn:ietf:params:oauth:token-type:jwt&
subject_token=eY...............&
audience=prod-gcp:namespace1:app1
```

##### Success response

TokenX responds with a JSON object that contains the new access token:

```json title="Success response body"
{
  "access_token" : "eyJraWQiOi..............",
  "expires_in" : 899,
  ...
}
```

Your application does not need to validate this token.

???+ tip "Cache your tokens"

    The `expires_in` field in the response indicates the lifetime of the token in seconds.

    Use this field to cache and reuse the token to minimize network latency impact.

    A safe cache key for this flow is `key = sha256($subject_token + $audience)`.

##### Error response

If the exchange request is invalid, you will receive a structured error as specified in 
[RFC 8693, Section 2.2.2](https://www.rfc-editor.org/rfc/rfc8693.html#name-error-response):

```json title="Error response body"
{
  "error_description" : "token exchange audience <some-audience> is invalid",
  "error" : "invalid_request"
}
```

## Consume API

Once you have acquired a new token, you can finally consume the target API by using the token as a [Bearer token](../../explanations/README.md#bearer-token):

```http
GET /resource HTTP/1.1

Host: api.example.com
Authorization: Bearer eyJraWQ...
```

[variables-ref]: ../reference/README.md#variables-for-acquiring-tokens

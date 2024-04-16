---
description: Enabling zero trust on the application layer
---

# TokenX

## Abstract 

!!! abstract
    ### What is TokenX?

    **TokenX** is the short term for [OAuth 2.0 Token Exchange](https://github.com/nais/tokendings) implemented in the context of Kubernetes.

    It consists of mainly 3 components:

    * [Tokendings](https://github.com/nais/tokendings) - an OAuth 2.0 Authorization Server implementing the OAuth 2.0 Token Exchange specification
    * [Jwker](https://github.com/nais/jwker/) - a Kubernetes operator responsible for registering applications as OAuth 2.0 clients in Tokendings
    * [Naiserator](https://github.com/nais/naiserator/) - a Kubernetes operator that handles the lifecycle of applications on the [NAIS platform](https://nais.io/)

    In short, TokenX is a OAuth 2.0 compliant add-on that enables and allows your application to maintain the [zero trust](../../appendix/zero-trust.md) _networking_ principles (together with components such as [**LinkerD**](https://linkerd.io/)). It does this by allowing applications to exchange and acquire properly scoped security tokens in order to securely communicate with each other.

    Interested readers may find more technical details in the [Tokendings documentation](https://github.com/nais/tokendings).

    ### Why do I need TokenX?

    In a [zero trust](../../appendix/zero-trust.md) architecture, one cannot rely on traditional boundaries such as **security zones** and **security gateways**. Such security measures are no longer required for applications that leverage TokenX correctly as each application is self-contained within its own zone; requiring specific tokens in order to communicate with other applications.

    Using TokenX correctly throughout a call-chain also ensures that the identity of the original caller or subject \(e.g. an end-user\) is propagated while still maintaining proper scoping and security between each application.

    ### When do I need TokenX?

    There are primarily two distinct cases where one must use TokenX:

    1. You have a user facing app using [ID-porten](idporten.md) that should perform calls to another app on behalf of a user.
    2. You have an app receiving tokens issued from Tokendings and need to call another app while still propagating the original user context.

???+ info "Overview of flow"
    ![The diagram shows 3 processes. The first one is OpenID Connect login. Logging in as an enduser, the token is collected from the ID provider using API1. Code snippet: { sub: “enduser” aud: “API1” iss: “ID-provider” } The second process is gettinig a tooken for API 2 (OAuth 2.0 Token exchange). AP1 gets a token for API2 based on ID-provider token, using TokenDings to verify token check access policy: Can API1 invoke API 2, issuing a new tokoen for API2. Code snippet: { sub: “enduser” aud: “API2” iss: “TokenDings” } The third process is calling API2 with JWT Bearer token. API1 calls API2 with token from TokenDings. API2 verifies token with access control, based on the enduser and returns information to API 1, which displays the information to the end user.](https://raw.githubusercontent.com/nais/tokendings/master/doc/downstream_example.svg)

## Configuration

### Spec

See the [NAIS manifest](../../nais-application/application.md#tokenxenabled).

### Getting Started

=== "nais.yaml"
    ```yaml
    spec:
      tokenx:
        enabled: true
      accessPolicy:
        inbound:
          rules:
            - application: app-2
            - application: app-3
              namespace: team-a
            - application: app-4
              namespace: team-b
              cluster: prod-gcp
    ```

### Access Policies

In order for other applications to acquire a token targeting your application, you **must explicitly** specify inbound access policies that authorizes these other applications.

Thus, the access policies defines _authorization_ on the application layer, and is enforced by Tokendings on token exchange operations.

For example:

```yaml
spec:
  tokenx:
    enabled: true
  accessPolicy:
    inbound:
      rules:
        - application: app-1
        - application: app-2
          namespace: team-a
        - application: app-3
          namespace: team-b
          cluster: prod-gcp
```

The above configuration authorizes the following applications:

* application `app-1` running in the **same namespace** and **same cluster** as your application
* application `app-2` running in the namespace `team-a` in the **same cluster**
* application `app-3` running in the namespace `team-b` in the cluster `prod-gcp`

## Usage

### Runtime Variables & Credentials

Your application will automatically be injected with both environment variables and files at runtime. You can use whichever is most convenient for your application.

The files are available at the following path: `/var/run/secrets/nais.io/jwker/`.

#### Variables for Exchanging Tokens

These variables are used for [client authentication](tokenx.md#client-authentication) and [exchanging tokens](tokenx.md#exchanging-a-token):

| Name                     | Description                                                                                                 |
|:-------------------------|:------------------------------------------------------------------------------------------------------------|
| `TOKEN_X_CLIENT_ID`      | [Client ID](concepts/actors.md#client-id) that uniquely identifies the application in TokenX.               |
| `TOKEN_X_PRIVATE_JWK`    | [Private JWK](concepts/cryptography.md#private-keys) containing an RSA key belonging to client.             |
| `TOKEN_X_TOKEN_ENDPOINT` | `token_endpoint` from the [metadata discovery document](concepts/actors.md#token-endpoint).                 |

#### Variables for Validating Tokens

These variables are used for [token validation](tokenx.md#token-validation):

| Name                     | Description                                                                                                 |
|:-------------------------|:------------------------------------------------------------------------------------------------------------|
| `TOKEN_X_CLIENT_ID`      | [Client ID](concepts/actors.md#client-id) that uniquely identifies the application in TokenX.               |
| `TOKEN_X_WELL_KNOWN_URL` | The URL for Tokendings' [metadata discovery document](concepts/actors.md#well-known-url-metadata-document). |
| `TOKEN_X_ISSUER`         | `issuer` from the [metadata discovery document](concepts/actors.md#issuer).                                 |
| `TOKEN_X_JWKS_URI`       | `jwks_uri` from the [metadata discovery document](concepts/actors.md#jwks-endpoint-public-keys).            |

### Client Authentication

Your application **must** authenticate itself with Tokendings when attempting to perform token exchanges. To do so, you must create a [client assertion](concepts/actors.md#client-assertion).

Create a [JWT](concepts/tokens.md#jwt) that is signed by your application using the [private key](concepts/cryptography.md#private-keys) contained within [`TOKEN_X_PRIVATE_JWK`](tokenx.md#variables-for-exchanging-tokens).

The assertion **must** contain the following claims:

| Claim     | Example Value                                    | Description                                                                                                                                                                                                                    |
|:----------|:-------------------------------------------------|:-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **`sub`** | `dev-gcp:aura:app-a`                             | The _subject_ of the token. Must be set to your application's own `client_id`, i.e. [`TOKEN_X_CLIENT_ID`](tokenx.md#variables-for-exchanging-tokens).                                                                          |
| **`iss`** | `dev-gcp:aura:app-a`                             | The _issuer_ of the token. Must be set to your application's own `client_id`, i.e. [`TOKEN_X_CLIENT_ID`](tokenx.md#variables-for-exchanging-tokens).                                                                           |
| **`aud`** | `https://tokenx.dev-gcp.nav.cloud.nais.io/token` | The _audience_ of the token. Must be set to Tokendings' `token_endpoint`, i.e. [`TOKEN_X_TOKEN_ENDPOINT`](tokenx.md#variables-for-exchanging-tokens).                                                                          |
| **`jti`** | `83c580a6-b479-426d-876b-267aa9848e2f`           | The _JWT ID_ of the token. Used to uniquely identify a token. Set this to a UUID or similar.                                                                                                                                   |
| **`nbf`** | `1597783152`                                     | `nbf` stands for _not before_. It identifies the time \(seconds after Epoch\) before which the JWT MUST NOT be accepted for processing.                                                                                        |
| **`iat`** | `1597783152`                                     | `iat` stands for _issued at_. It identifies the time \(seconds after Epoch\) in which the JWT was issued \(or created\).                                                                                                       |
| **`exp`** | `1597783272`                                     | `exp` is the _expiration time_ \(seconds after Epoch\) of the token. This **must** not be more than **120** seconds after `nbf` and `iat`. That is, the maximum lifetime of the token must be no greater than **120 seconds**. |

Additionally, the headers of the assertion must contain the following parameters:

| Parameter | Value                                  | Description                                                                                                                                                                    |
|:----------|:---------------------------------------|:-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **`kid`** | `93ad09a5-70bc-4858-bd26-5ff4a0c5f73f` | The key identifier of the key used to sign the assertion. This identifier is available in the JWK found in [`TOKEN_X_PRIVATE_JWK`](tokenx.md#variables-for-exchanging-tokens). |
| **`typ`** | `JWT`                                  | Represents the type of this JWT. Set this to `JWT`.                                                                                                                            |
| **`alg`** | `RS256`                                | Represents the cryptographic algorithm used to secure the JWT. Set this to `RS256`.                                                                                            |

The assertion should be unique and only used once. That is, every request to Tokendings should contain a unique client assertion:

- Set the JWT ID (`jti`) claim to a unique value, such as an UUID.
- Set the JWT expiry (`exp`) claim so that the lifetime of the token is reasonably low:
    - The _maximum_ lifetime allowed is 120 seconds.
    - A lifetime between 10-30 seconds should be fine for most situations.

#### Example Client Assertion Values

**Header**

```json
{
  "kid": "93ad09a5-70bc-4858-bd26-5ff4a0c5f73f",
  "typ": "JWT",
  "alg": "RS256"
}
```

**Payload**

```json
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

### Exchanging a token

In order to acquire a token that is properly scoped to a given target application, you must exchange an existing _subject token_ (i.e. a token that contains a subject, in this case a citizen end-user).

Tokendings will then issue an `access_token` in JWT format, based on the parameters set in the token request. The token can then be used as a [**Bearer token**](concepts/tokens.md#bearer-token) in the Authorization header when calling your target API on behalf of the aforementioned subject.

#### Prerequisites

* You have a _subject token_ in the form of an `access_token` issued by one of the following providers:
    - [ID-porten](idporten.md)
    - Tokendings
* You have a [client assertion](tokenx.md#client-authentication) that _authenticates_ your application.

#### Exchange Request

The following denotes the required parameters needed to perform an exchange request.

| Parameter               | Value                                                    | Comment                                                                                                                                                                                                                                                            |
|:------------------------|:---------------------------------------------------------|:-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `grant_type`            | `urn:ietf:params:oauth:grant-type:token-exchange`        | The identifier of the OAuth 2.0 grant to use, in this case the OAuth 2.0 Token Exchange grant. This grants allows applications to exchange one token for a new one containing much of the same information while still being correctly "scoped" in terms of OAuth. |
| `client_assertion_type` | `urn:ietf:params:oauth:client-assertion-type:jwt-bearer` | Identifies the type of _assertion_ the client/application will use to authenticate itself to Tokendings, in this case a JWT.                                                                                                                                       |
| `client_assertion`      | A serialized JWT identifying the calling app             | The [client assertion](tokenx.md#client-authentication); a JWT signed by the calling client/application used to identify said client/application.                                                                                                                  |
| `subject_token_type`    | `urn:ietf:params:oauth:token-type:jwt`                   | Identifies the type of token that will be exchanged with a new one, in this case a JWT                                                                                                                                                                             |
| `subject_token`         | A serialized JWT, the token that should be exchanged     | The actual token \(JWT\) containing the signed-in user. Should be an `access_token`.                                                                                                                                                                               |
| `audience`              | The identifier of the app you wish to use the token for  | Identifies the intended audience for the resulting token, i.e. the target app you request a token for. This value shall be the `client_id` of the target app using the naming scheme `<cluster>:<namespace>:<appname>` e.g. `prod-fss:namespace1:app1`             |

Send the request to the `token_endpoint`, i.e. [`TOKEN_X_TOKEN_ENDPOINT`](tokenx.md#variables-for-exchanging-tokens).

???+ example
    ```http
    POST /token HTTP/1.1
    Host: tokenx.prod-gcp.nav.cloud.nais.io
    Content-Type: application/x-www-form-urlencoded

    grant_type=urn:ietf:params:oauth:grant-type:token-exchange&
    client_assertion_type=urn:ietf:params:oauth:client-assertion-type:jwt-bearer&
    client_assertion=eY...............&
    subject_token_type=urn:ietf:params:oauth:token-type:jwt&
    subject_token=eY...............&
    audience=prod-fss:namespace1:app1
    ```

#### Exchange Response

Tokendings will respond with a JSON object

???+ example
    ```json
    {
      "access_token" : "eyJraWQiOi..............",
      "issued_token_type" : "urn:ietf:params:oauth:token-type:access_token",
      "token_type" : "Bearer",
      "expires_in" : 899
    }
    ```

The `expires_in` field denotes the lifetime of the token in seconds.

Cache and reuse the token until it expires to minimize network latency impact.

A safe cache key is `key = sha256($subject_token + $audience)`.

#### Exchange Error Response

If the exchange request is invalid, Tokendings will respond with a structured error, as specified in 
[RFC 8693, Section 2.2.2](https://www.rfc-editor.org/rfc/rfc8693.html#name-error-response):

???+ example
    ```json
    {
        "error_description" : "token exchange audience <some-audience> is invalid",
        "error" : "invalid_request"
    }
    ```

### Token Validation

If your app is a [resource server / API](concepts/actors.md#resource-server) and receives a token from another application, it is **your responsibility** to [validate the token](concepts/tokens.md#token-validation) intended for your application.

Configure your app with the OAuth 2.0 Authorization Server Metadata found at the well-known endpoint, [`TOKEN_X_WELL_KNOWN_URL`](tokenx.md#variables-for-validating-tokens).
Alternatively, use the resolved values from said endpoint for convenience:

- [`TOKEN_X_ISSUER`](tokenx.md#variables-for-validating-tokens)
- [`TOKEN_X_JWKS_URI`](tokenx.md#variables-for-validating-tokens)

#### Signature Verification

* The token should be signed with the `RS256` algorithm (defined in JWT header). Tokens not matching this algorithm should be rejected.
* Verify that the signature is correct.
  * The issuer's signing keys can be retrieved from the JWK Set (JWKS) at the `jwks_uri`, i.e. [`TOKEN_X_JWKS_URI`](tokenx.md#variables-for-validating-tokens).
  * The `kid` attribute in the token header is thus a reference to a key contained within the JWK Set.
  * The token signature should be verified against the public key in the matching JWK.

#### Claims

The following claims are by default provided in the issued token and should explicitly be validated:

* `iss` \(**issuer**\): The issuer of the token **must match exactly** with the Tokendings issuer URI ([`TOKEN_X_ISSUER`](tokenx.md#variables-for-validating-tokens)).
* `aud` \(**audience**\): The intended audience for the token, **must match** your application's `client_id` ([`TOKEN_X_CLIENT_ID`](tokenx.md#variables-for-validating-tokens)).
* `exp` \(**expiration time**\): Expiration time, i.e. tokens received after this date **must be rejected**.
* `nbf` \(**not before time**\): The token cannot be used before this time, i.e. if the token is issued in the "future" (outside "reasonable" clock skew) it **must be rejected**.
* `iat` \(**issued at time**\): The time at which the token has been issued. **Must be before `exp`**.
* `sub` \(**subject**\): If applicable, used in user centric access control. This represents a unique identifier for the user.

Other non-standard claims (with some exceptions, see the [claim mappings](#claim-mappings) section) in the token are copied verbatim from the original token issued by `idp` (the original issuer of the subject token).
For example, the claim used for the personal identifier (_personidentifikator_) for tokens issued by ID-porten is `pid`.

#### Claim Mappings

Some claims are mapped to a different value for legacy/compatibility reasons, depending on the original issuer (`idp`).

The table below shows the claim mappings:

| Claim | Original Value             | Mapped Value  |
|:------|:---------------------------|:--------------|
| `acr` | `idporten-loa-substantial` | `Level3`      |
| `acr` | `idporten-loa-high`        | `Level4`      |

This currently only affects tokens from ID-porten, i.e. `idp=https://test.idporten.no` or `idp=https://idporten.no`.

The mappings will be removed at some point in the future.
If you're using the `acr` claim in any way, check for both the original and mapped values.

#### Example Token (exchanged from ID-porten)

The following example shows the claims of a token issued by Tokendings, where the exchanged subject token is issued by [ID-porten](idporten.md):

???+ example 
    ```json
    {
      "at_hash": "x6lQGCdbMX62p1VHeDsFBA",
      "sub": "HmjqfL7....",
      "amr": [
        "BankID"
      ],
      "iss": "https://tokenx.prod-gcp.nav.cloud.nais.io",
      "pid": "12345678910",
      "locale": "nb",
      "client_id": "prod-gcp:team-a:app-a",
      "sid": "DASgLATSjYTp__ylaVbskHy66zWiplQrGDAYahvwk1k",
      "aud": "prod-fss:team-b:app-b",
      "acr": "Level4",
      "nbf": 1597783152,
      "idp": "https://idporten.no",
      "auth_time": 1611926877,
      "exp": 1597783452,
      "iat": 1597783152,
      "jti": "97f580a6-b479-426d-876b-267aa9848e2e"
    }
    ```

## Local Development

See also the [development overview](overview/development.md) page.

### Token Generator

In many cases, you want to locally develop and test against a secured API (or [resource server](concepts/actors.md#resource-server)) in the development environments.
To do so, you need a [token](concepts/tokens.md#bearer-token) in order to access said API.

The service <https://tokenx-token-generator.intern.dev.nav.no> can be used in order to generate tokens in the development environments.

#### Prerequisites

1. The API application must be configured with [TokenX enabled](#configuration).
2. Pre-authorize the token generator service by adding it to the API application's [access policy](#access-policies):
    ```yaml
    spec:
      accessPolicy:
        inbound:
          rules:
            - application: tokenx-token-generator
              namespace: aura
              cluster: dev-gcp
    ```

#### Getting a token

1. Visit <https://tokenx-token-generator.intern.dev.nav.no/api/obo?aud=&lt;audience&gt;> in your browser.
    - Replace `<audience>` with the intended _audience_ of the token, in this case the API application.
    - The audience value must be on the form of `<cluster>.<namespace>.<application>`
    - For example: `dev-gcp.aura.my-app`
2. You will be redirected to log in at ID-porten (if not already logged in).
3. After logging in, you should be redirected back to the token generator and presented with a JSON response containing an `access_token`.
4. Use the `access_token` as a [Bearer token](concepts/tokens.md#bearer-token) for calls to your API application.
5. Success!

### Test Clients

If [mocking](overview/development.md#mocking) isn't sufficient, we also maintain some test clients for use in local development environments.

Note that the associated credentials may be rotated at any time.

As developers, you're responsible for treating these credentials as secrets. Never commit or distribute these to
version control or expose them to publicly accessible services.

Credentials are found in Vault under [/secrets/secret/.common/tokenx](https://vault.adeo.no/ui/vault/secrets/secret/list/.common/tokenx/)

The clients are [pre-authorized](#access-policies) as follows:

- `app-1` is pre-authorized for `app-2`

They are otherwise equal to a [default client](#configuration).

---
description: Enabling zero trust on the application layer
---

# TokenX

!!! warning "Limited Availability"
    This feature is only available in [team namespaces](../../clusters/team-namespaces.md).

    It currently only supports _self-service/citizen facing applications_ - however other use-cases have been identified.

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

    1. You have a user facing app using [ID-porten](idporten/README.md) that should perform calls to another app on behalf of a user.
    2. You have an app receiving tokens issued from Tokendings and need to call another app while still propagating the original user context.

???+ info "Overview of flow"
    ![Overview of token exchange flow](https://raw.githubusercontent.com/nais/tokendings/master/doc/downstream_example.svg)

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

Thus, the access policies defines _authorization_ on the application layer, and is enforced by [Tokendings](https://github.com/nais/tokendings) on token exchange operations.

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

Enabling TokenX will expose the following runtime environment variables and files \(under the directory `/var/run/secrets/nais.io/jwker`\) for your application:

---

#### `TOKEN_X_WELL_KNOWN_URL`

???+ note

    The well-known URL for the OAuth 2.0 Token Exchange authorization server (in this case, Tokendings) [metadata document](concepts/actors.md#well-known-url-metadata-document).

    Example value: `https://tokendings.dev-gcp.nais.io/.well-known/oauth-authorization-server`
---

#### `TOKEN_X_CLIENT_ID`

???+ note
    
    [Client ID](concepts/actors.md#client-id) that uniquely identifies the application in TokenX. It has the following naming scheme:

    ```text
    <cluster>:<metadata.namespace>:<metadata.name>
    ```

    This value should be used in the [client assertion](tokenx.md#client-authentication) when exchanging a token with [Tokendings](https://github.com/nais/tokendings).

---

#### `TOKEN_X_PRIVATE_JWK`

???+ note

    [Private JWK](concepts/cryptography.md#private-keys) containing an RSA key belonging to your client. Used to sign client assertions during [client authentication](tokenx.md#client-authentication).

    ```json
    {
        "use": "sig",
        "kty": "RSA",
        "kid": "jXDxKRE6a4jogcc4HgkDq3uVgQ0",
        "n": "xQ3chFsz...",
        "e": "AQAB",
        "d": "C0BVXQFQ...",
        "p": "9TGEF_Vk...",
        "q": "zb0yTkgqO...",
        "dp": "7YcKcCtJ...",
        "dq": "sXxLHp9A...",
        "qi": "QCW5VQjO..."
    }
    ```

#### `TOKEN_X_ISSUER`

???+ note

    `issuer` from the [metadata discovery document](concepts/actors.md#issuer).

    Example value: `https://tokendings.dev-gcp.nais.io`

---

#### `TOKEN_X_JWKS_URI`

???+ note

    `jwks_uri` from the [metadata discovery document](concepts/actors.md#jwks-endpoint-public-keys).

    Example value: `https://tokendings.dev-gcp.nais.io/jwks`

---

#### `TOKEN_X_TOKEN_ENDPOINT`

???+ note

    `token_endpoint` from the [metadata discovery document](concepts/actors.md#token-endpoint).

    Example value: `https://tokendings.dev-gcp.nais.io/token`

---

### Client Authentication

Your application **must** authenticate itself with [Tokendings](https://github.com/nais/tokendings) when attempting to perform token exchanges. To do so, you must create a [client assertion](concepts/actors.md#client-assertion).

In other words, you must create a [JWT](concepts/tokens.md#jwt) that is signed by your application using the [private key](concepts/cryptography.md#private-keys) contained within [`TOKEN_X_PRIVATE_JWK`](tokenx.md#token_x_private_jwk).

The assertion **must** contain the following claims:

| Claim     | Example Value                              | Description                                                                                                                                                                                                                          |
|:----------|:-------------------------------------------|:-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **`sub`** | `dev-gcp:aura:app-a`                       | The _subject_ of the token. Must be set to your application's own [`client_id`](tokenx.md#token_x_client_id).                                                                                                                        |
| **`iss`** | `dev-gcp:aura:app-a`                       | The _issuer_ of the token. Must be set to your application's own [`client_id`](tokenx.md#token_x_client_id).                                                                                                                         |
| **`aud`** | `https://tokendings.dev-gcp.nais.io/token` | The _audience_ of the token. Must be set to the `token_endpoint` of [Tokendings](https://github.com/nais/tokendings). The value of this exists in the metadata found at the [well-known endpoint](tokenx.md#token_x_well_known_url). |
| **`jti`** | `83c580a6-b479-426d-876b-267aa9848e2f`     | The _JWT ID_ of the token. Used to uniquely identify a token. Set this to a UUID or similar.                                                                                                                                         |
| **`nbf`** | `1597783152`                               | `nbf` stands for _not before_. It identifies the time \(seconds after Epoch\) before which the JWT MUST NOT be accepted for processing.                                                                                              |
| **`iat`** | `1597783152`                               | `iat` stands for _issued at_. It identifies the time \(seconds after Epoch\) in which the JWT was issued \(or created\).                                                                                                             |
| **`exp`** | `1597783272`                               | `exp` is the _expiration time_ \(seconds after Epoch\) of the token. This **must** not be more than **120** seconds after `nbf` and `iat`. That is, the maximum lifetime of the token must be no greater than **120 seconds**.       |

Additionally, the headers of the assertion must contain the following parameters:

| Parameter | Value                                  | Description                                                                                                                                                        |
|:----------|:---------------------------------------|:-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **`kid`** | `93ad09a5-70bc-4858-bd26-5ff4a0c5f73f` | The key identifier of the key used to sign the assertion. This identifier is available in the JWK found in [`TOKEN_X_PRIVATE_JWK`](tokenx.md#token_x_private_jwk). |
| **`typ`** | `JWT`                                  | Represents the type of this JWT. Set this to `JWT`.                                                                                                                |
| **`alg`** | `RS256`                                | Represents the cryptographic algorithm used to secure the JWT. Set this to `RS256`.                                                                                |

An assertion should be unique and not be reused when authenticating with _Tokendings_ in accordance with the 
[security considerations in RFC 7521](https://datatracker.ietf.org/doc/html/rfc7521#section-8.2).

That is, every request to Tokendings should contain a unique client assertion:

- Set the JWT ID (`jti`) claim to a unique value, such as an UUID.
- Set the JWT expiry (`exp`) claim so that the lifetime of the token is reasonably low.
    - Tokendings allows a _maximum_ lifetime of 120 seconds.
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
  "aud": "https://tokendings.prod-gcp.nais.io/token",
  "nbf": 1592508050,
  "iss": "prod-gcp:namespace-gcp:gcp-app",
  "exp": 1592508171,
  "iat": 1592508050,
  "jti": "fd9717d3-6889-4b22-89b8-2626332abf14"
}
```

### Exchanging a token

In order to acquire a token from [Tokendings](https://github.com/nais/tokendings) that is properly scoped to a given target application, you must exchange an existing _subject token_ \(i.e. a token that contains a subject, in this case a citizen end-user\).

Tokendings will then issue an `access_token` in JWT format, based on the parameters set in the token request. The token can then be used as a [**Bearer token**](concepts/tokens.md#bearer-token) in the Authorization header when calling your target API on behalf of the aforementioned subject.

#### Prerequisites

* You have a _subject token_ in the form of an `access_token` issued by one of the following providers:
    - [ID-porten](idporten/README.md)
    - Tokendings
    - [Loginservice](../../legacy/sunset.md#loginservice) (Remember that loginservice is a deprecated legacy system. TokenX currently accepts these tokens during the grace period for migration.)
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

The request should then sent to the `token_endpoint` of Tokendings, the value of which exists in the metadata found at the [well-known endpoint](tokenx.md#token_x_well_known_url).

???+ example
    ```http
    POST /token HTTP/1.1
    Host: tokendings.prod-gcp.nais.io
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

If performance is a concern, the token can be cached for reuse within the validity period indicated by the `expires_in` field.

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

Configure your app with the [OAuth 2.0 Authorization Server Metadata](concepts/actors.md#well-known-url-metadata-document) from the [well-known endpoint](tokenx.md#token_x_well_known_url). 
This contains the [issuer name](concepts/actors.md#issuer) and [JWKS endpoint](concepts/actors.md#jwks-endpoint-public-keys) containing the authorization server's [public keys](concepts/cryptography.md#public-keys).

#### Signature Verification

* The token should be signed with the `RS256` algorithm \(defined in JWT header\). Tokens not matching this algorithm should be rejected.
* Verify that the signature is correct.
  * The issuer's signing keys can be retrieved from the JWK Set \(JWKS\) at the `jwks_uri`.
  * The `kid` attribute in the token header is thus a reference to a key contained within the JWK Set.
  * The token signature should be verified against the public key in the matching JWK.

#### Claims

The following claims are by default provided in the issued token and should explicitly be validated:

* `iss` \(**issuer**\): The issuer of the token, the Tokendings issuer URI **must match exactly**.
* `aud` \(**audience**\): The intended audience for the token, **must match** your application's [client\_id](tokenx.md#token_x_client_id).
* `exp` \(**expiration time**\): Expiration time, i.e. tokens received after this date **must be rejected**.
* `nbf` \(**not before time**\): The token cannot be used before this time, i.e. if the token is issued in the "future" \(outside "reasonable" clock skew\) it **must be rejected**.
* `iat` \(**issued at time**\): The time at which the token has been issued. **Must be before `exp`**.
* `sub` \(**subject**\): If applicable, used in user centric access control. This represents a unique identifier for the user.

Other non-standard claims in the token are copied verbatim from the original token issued by `idp`.
For example, the claim used for the national identity number (_fødselsnummer_) for tokens issued by ID-porten is `pid`.

To extract such non-standard information from tokens, first use the `idp` claim to find the original token issuer. You can then map the original issuer's preferred claims to the claims in tokens issued by TokenX.

#### Example Token \(exchanged from ID-porten\)

The following example shows the claims of a token issued by Tokendings, where the exchanged subject token is issued by [ID-porten](idporten/README.md):

???+ example 
    ```json
    {
      "at_hash": "x6lQGCdbMX62p1VHeDsFBA",
      "sub": "HmjqfL7....",
      "amr": [
        "BankID"
      ],
      "iss": "https://tokendings.prod-gcp.nais.io",
      "pid": "12345678910",
      "locale": "nb",
      "client_id": "prod-gcp:team-a:app-a",
      "sid": "DASgLATSjYTp__ylaVbskHy66zWiplQrGDAYahvwk1k",
      "aud": "prod-fss:team-b:app-b",
      "acr": "Level4",
      "nbf": 1597783152,
      "idp": "https://oidc.difi.no/idporten-oidc-provider/",
      "auth_time": 1611926877,
      "exp": 1597783452,
      "iat": 1597783152,
      "jti": "97f580a6-b479-426d-876b-267aa9848e2e"
    }
    ```

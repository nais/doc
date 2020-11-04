---
description: >
  Enabling zero trust on the application layer
---

# TokenX (Token Exchange)

{% hint style="warning" %}
**Status: Opt-In Open Beta**

This feature is only available in [team namespaces](../../clusters/team-namespaces.md).
 
It currently only supports *self-service/citizen facing applications* - however other use-cases have been identified.
{% endhint %}

## Abstract

### What is TokenX?

**TokenX** is the short term for [OAuth 2.0 Token Exchange][Tokendings] implemented in the context of Kubernetes. 

It consists of mainly 3 components:

* [Tokendings](https://github.com/nais/tokendings) - an OAuth 2.0 Authorization Server implementing the OAuth 2.0 Token Exchange specification
* [Jwker](https://github.com/nais/jwker/) - a Kubernetes operator responsible for registering applications as OAuth 2.0 clients in Tokendings
* [Naiserator](https://github.com/nais/naiserator/) -  a Kubernetes operator that handles the lifecycle of applications on the [NAIS platform](https://nais.io/)

In short, TokenX is a OAuth 2.0 compliant add-on that enables and allows your application to maintain the [zero trust] *networking* principles (together with components such as **[Istio]**). It does this by allowing applications to exchange and acquire properly scoped security tokens in order to securely communicate with each other. 

Interested readers may find more details in the [Tokendings documentation][Tokendings].

### Why do I need TokenX?

In a [zero trust] architecture, one cannot rely on traditional boundaries such as **security zones** and **security gateways**. Such security measures are no longer required for applications that leverage TokenX correctly as each application is self-contained within its own zone; requiring specific tokens in order to communicate with other applications.

Using TokenX correctly throughout a call-chain also ensures that the identity of the original caller or subject (e.g. an end-user) is propagated while still maintaining proper scoping and security between each application.

### When do I need TokenX?

There are primarily two distinct cases where one must use TokenX:

1. You have a user facing app using [ID-porten](idporten.md) that should perform calls to another app on behalf of a user.
2. You have an app receiving tokens issued from Tokendings and need to call another app while still propagating the original user context.

### Overview of flow

![Overview of token exchange flow](https://raw.githubusercontent.com/nais/tokendings/master/doc/downstream_example.svg)

## Configuration

### Spec

See the [NAIS manifest](../../nais-application/reference.md#spec-tokenx-enabled).

### Getting Started 

{% code-tabs %}
{% code-tabs-item title="Minimal nais.yaml example" %}
```yaml
apiVersion: "nais.io/v1alpha1"
kind: "Application"
metadata:
  name: app-1
  namespace: aura
  labels:
    team: aura
spec:
  image: navikt/app-1:1234
  tokenx:
    enabled: true
```
{% endcode-tabs-item %}
{% code-tabs-item title="Full nais.yaml example" %}
```yaml
apiVersion: "nais.io/v1alpha1"
kind: "Application"
metadata:
  name: app-1
  namespace: aura
  labels:
    team: aura
spec:
  image: navikt/app-1:1234
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
{% endcode-tabs-item %}
{% endcode-tabs %}

### Access Policies

In order for other applications to acquire a token targeting your application, you **must explicitly** specify inbound access policies that authorizes these other applications.

Thus, the access policies defines _authorization_ on the application layer, and is enforced by [Tokendings] on token exchange operations.

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

- application `app-1` running in the **same namespace** and **same cluster** as your application
- application `app-2` running in the namespace `team-a` in the **same cluster**
- application `app-3` running in the namespace `team-b` in the cluster `prod-gcp`

## Usage

### Runtime Variables & Credentials

Enabling TokenX will expose the following runtime environment variables and files (under the directory `/var/run/secrets/nais.io/jwker`) for your application:

* `TOKEN_X_WELL_KNOWN_URL`
* `TOKEN_X_CLIENT_ID`
* `TOKEN_X_PRIVATE_JWK`

#### `TOKEN_X_WELL_KNOWN_URL`

The well-known URL of the OAuth 2.0 Token Exchange authorization server, in this case Tokendings. This URL contains the server metadata as defined in [RFC8414] that your application may use. For example:

* `issuer`
* `token_endpoint`
* `jwks_uri`

See [OAuth 2.0 Authorization Server Metadata][RFC8414] for more information about the contents of the response from the well-known url.

#### `TOKEN_X_CLIENT_ID`

Unique `client_id` which represents your application using the following naming scheme:

```
<cluster>:<metadata.namespace>:<metadata.name>
```

This value should be used in the [client assertion](#client-authentication) when exchanging a token with [Tokendings].

#### `TOKEN_X_PRIVATE_JWK`

Contains a JWK with the private RSA key for creating signed JWTs when [authenticating to Tokendings with a signed `client_assertion`](#client-authentication).

Example value:

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

### Client Authentication

Your applications **must** authenticate itself with [Tokendings] when attempting to perform token exchanges. To do so, you must create a _client assertion_ as per [RFC7523]. 

In other words, you must create a [JSON Web Token (JWT)][RFC7519] that is signed by your application using the private key contained within [`TOKEN_X_PRIVATE_JWK`](#token_x_private_jwk). 

The assertion **must** contain the following claims:

| Claim      | Example Value                              | Description                                                                                                                                                                                                                  |
| ---------- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |                                                                                                                         |
| **`sub`**  | `dev-gcp:aura:app-a`                       | The _subject_ of the token. Must be set to your application's own [`client_id`](#token_x_client_id).                                                                                                                         |
| **`iss`**  | `dev-gcp:aura:app-a`                       | The _issuer_ of the token. Must be set to your application's own [`client_id`](#token_x_client_id).                                                                                                                          |
| **`aud`**  | `https://tokendings.dev-gcp.nais.io/token` | The _audience_ of the token. Must be set to the `token_endpoint` of [Tokendings]. The value of this exists in the metadata found at the [well-known endpoint](#token_x_well_known_url).                                      |
| **`jti`**  | `83c580a6-b479-426d-876b-267aa9848e2f`     | The _JWT ID_ of the token. Used to uniquely identify a token. Set this to a UUID or similar.                                                                                                                                 |
| **`nbf`**  | `1597783152`                               | `nbf` stands for _not before_. It identifies the time (seconds after Epoch) before which the JWT MUST NOT be accepted for processing.                                                                                        |
| **`iat`**  | `1597783152`                               | `iat` stands for _issued at_. It identifies the time (seconds after Epoch) in which the JWT was issued (or created).                                                                                                         |
| **`exp`**  | `1597783272`                               | `exp` is the _expiration time_ (seconds after Epoch) of the token. This **must** not be more than **120** seconds after `nbf` and `iat`. That is, the maximum lifetime of the token must be no greater than **120 seconds**. |

Additionally, the headers of the assertion must contain the following parameters:

| Parameter | Value                                  | Description                                                                                                                                               |
| --------- | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`kid`** | `93ad09a5-70bc-4858-bd26-5ff4a0c5f73f` | The key identifier of the key used to sign the assertion. This identifier is available in the JWK found in [`TOKEN_X_PRIVATE_JWK`](#token_x_private_jwk). |
| **`typ`** | `JWT`                                  | Represents the type of this JWT. Set this to `JWT`.                                                                                                       |
| **`alg`** | `RS256`                                | Represents the cryptographic algorithm used to secure the JWT. Set this to `RS256`.                                                                       |

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

In order to acquire a token from [Tokendings] that is properly scoped to a given target application, you must exchange an existing _subject token_ (i.e. a token that contains a subject, in this case a citizen end-user).

Tokendings will then issue an `access_token` in JWT format, based on the parameters set in the token request. The token can then be used as a **Bearer token** in the Authorization header when calling your target API on behalf of the aforementioned subject.

#### Prerequisites

- You have a _subject token_ in the form of an `access_token` issued by one of the following providers:
  - [ID-porten](idporten.md)
  - Tokendings
- You have a [client assertion](#client-authentication) that _authenticates_ your application.

#### Exchange Request

The following denotes the required parameters needed to perform an exchange request.

| Parameter               | Value                                                    | Comment                                                      |
| ----------------------- | -------------------------------------------------------- | ------------------------------------------------------------ |
| `grant_type`            | `urn:ietf:params:oauth:grant-type:token-exchange`        | The identifier of the OAuth 2.0 grant to use, in this case the OAuth 2.0 Token Exchange grant. This grants allows applications to exchange one token for a new one containing much of the same information while still being correctly "scoped" in terms of OAuth. |
| `client_assertion_type` | `urn:ietf:params:oauth:client-assertion-type:jwt-bearer` | Identifies the type of *assertion* the client/application will use to authenticate itself to Tokendings, in this case a JWT. |
| `client_assertion`      | A serialized JWT identifying the calling app             | The [client assertion](#client-authentication); a JWT signed by the calling client/application used to identify said client/application. |
| `subject_token_type`    | `urn:ietf:params:oauth:token-type:jwt`                   | Identifies the type of token that will be exchanged with a new one, in this case a JWT |
| `subject_token`         | A serialized JWT, the token that should be exchanged     | The actual token (JWT) containing the signed-in user. Should be an `access_token`. |
| `audience`              | The identifier of the app you wish to use the token for  | Identifies the intended audience for the resulting token, i.e. the target app you request a token for. This value shall be the `client_id` of the target app using the naming scheme `<cluster>:<namespace>:<appname>` e.g. `prod-fss:namespace1:app1` |

The request should then sent to the `token_endpoint` of Tokendings, the value of which exists in the metadata found at the [well-known endpoint](#token_x_well_known_url).

Example:

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

{% hint style="info" %}
See [frontend-dings] for a complete example that illustrates:

- end-user authentication through [ID-porten](idporten.md)
- token exchange with the user's `access_token`
- calling a protected API using the exchanged token
{% endhint %}

### Token Validation

If your app receives a token from another application, it is **your responsibility** to ensure this token is valid and intended for your application.

Configure your app with the [OAuth 2.0 Authorization Server Metadata](https://www.rfc-editor.org/rfc/rfc8414.html) from the [well-known endpoint](#token_x_well_known_url) in order to retrieve issuer name and `jwks_uri` for public keys retrieval.

#### Signature Verification

- The token should be signed with the `RS256` algorithm (defined in JWT header). Tokens not matching this algorithm should be rejected.
- Verify that the signature is correct.
  - The issuer's signing keys can be retrieved from the JWK Set (JWKS) at the `jwks_uri`.
  - The `kid` attribute in the token header is thus a reference to a key contained within the JWK Set.
  - The token signature should be verified against the public key in the matching JWK.

#### Claims

The following claims in the token should explicitly be validated:

- `iss` (**issuer**): The issuer of the token, the Tokendings issuer URI **must match exactly**.
- `aud` (**audience**): The intended audience for the token, **must match** your application's [client_id](#token_x_client_id).
- `exp` (**expiration time**): Expiration time, i.e. tokens received after this date **must be rejected**.
- `nbf` (**not before time**): The token cannot be used before this time, i.e. if the token is issued in the "future" (outside "reasonable" clock skew) it **must be rejected**.
- `iat` (**issued at time**): The time at which the token has been issued. **Must be before `exp`**.
- `sub` (**subject**): If applicable, used in user centric access control. This represents a unique identifier for the user.

#### Example Token (exchanged from ID-porten)

The following example shows the claims of a token issued by Tokendings, where the exchanged subject token is issued by IDPorten:

```json
{
  "sub": "HmjqfL7....",
  "iss": "https://tokendings.prod-gcp.nais.io",
  "client_amr": "client_secret_post",
  "pid": "12345678910",
  "token_type": "Bearer",
  "client_id": "prod-gcp:team-a:app-a",
  "aud": "prod-fss:team-b:app-b",
  "acr": "Level4",
  "nbf": 1597783152,
  "idp": "https://oidc.difi.no/idporten-oidc-provider/",
  "scope": "openid",
  "exp": 1597783452,
  "iat": 1597783152,
  "client_orgno": "889640782",
  "jti": "97f580a6-b479-426d-876b-267aa9848e2e",
  "consumer": {
    "authority": "iso6523-actorid-upis",
    "ID": "0192:889640782"
  }
}
```

[zero trust]: ../../appendix/zero-trust/README.md
[Istio]: https://istio.io/
[OAuth 2.0 Token Exchange]: https://www.rfc-editor.org/rfc/rfc8693.html
[Tokendings]: https://github.com/nais/tokendings
[RFC8414]: https://tools.ietf.org/html/rfc8414
[RFC7523]: https://tools.ietf.org/html/rfc7523
[RFC7519]: https://tools.ietf.org/html/rfc7519
[frontend-dings]: https://github.com/nais/frontend-dings

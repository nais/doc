---
description: >
  Enabling zero trust on the application layer
---

# TokenX (Token Exchange)

{% hint style="danger" %}
Status: currently in open beta.

Only available in *GCP* and for *self-service/citizen facing applications* for now (however other use-cases have been identified)
{% endhint %}

**TokenX** is the short term for [OAuth 2.0 Token Exchange](https://www.rfc-editor.org/rfc/rfc8693.html) implemented in a **k8s** context. It consists of mainly 3 components:

* [TokenDings](https://github.com/nais/tokendings) - an OAuth 2.0 Authorization server implementing the OAuth 2.0 Token Exchange specification
* [Jwker](https://github.com/nais/jwker/) - a k8s operator responsible for registering applications as OAuth 2.0 clients in TokenDings
* [Naiserator](https://github.com/nais/naiserator/) -  a k8s operator that handles the lifecycle of applications on the [NAIS platform](https://nais.io/)

TokenX is OAuth 2.0 compliant and can provide applications with security tokens in order to securely communicate with eachother in a **zero trust** architecture - to the extent that  traditional boundaries such as **security zones** and **security gateways** can be made obsolete. 

It will ensure that the original caller/subject identity is propagated while still maintaining app to app security. TokenX is an add-on to the *zero trust networking* principles (with components such as **Istio**), focusing on the application layer, making your applications truly capable of maintaining the *zero trust* paradigm. 

TokenDings issues tokens based on the very same information as Istio for enforcing secure app-to-app communication, while stile maintaining the identity of the original caller (in many cases the end-user). 

If you need more detailed information about TokenDings and the relevant `OAuth 2.0` specifications implemented you can read more about it [here](https://github.com/nais/tokendings).

## When to use Token Exchange

* You have a user facing app and need to call another app on behalf of this user (currently only applicable for *self-service/citizen facing applications* for now, i.e. not applicable for Azure AD apps)
* You have an app receiving tokens from TokenDings and need to call another app while still propagating the original subject identity

## Getting Started

When creating your application [manifest](../basics/application.md) you must specify incoming and outgoing traffic from your application in an [access policy](../nais-application/access-policy.md), i.e. which applications should be allowed to access your application on the HTTP layer and which HTTP endpoints you need access to outside your own application.

The information provided in the access policy will be used to provision TokenDings with your app as an authorized OAuth 2.0 Client through the k8s operator [Jwker](https://github.com/nais/jwker/), which in turn will generate the keys/secrets you need to communicate with TokenDings; i.e. to get a token in order to communicate with another application.

### Example

Your app is app **app-1**. The following example shows the details necessary for other applications being able to request an OAuth 2.0 access_token for your application:

* if it should allow requests from **app-2** within the same namespace
* if it should allow requests from **app-3** from another namespace in the same cluster
* if it should allow requests from **app-4** from another namespace in another cluster

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
  ingresses:
    - "https://my.application"
    - "https://my.application.dev.nais.io"
  accessPolicy:
    inbound:
      rules:
        - application: app-2
        - application: app-3
          namespace: anothernamespace
        - application: app-4
          namespace: anothernamespace
          cluster: anothercluster
```

The essence of this example is that the application receiving a request from another application, i.e. app-1, owns the access policy of which applications are allowed to request access_tokens from TokenDings. 

### Credentials / Secrets

Deploying an application with an [access policy](../nais-application/access-policy.md) will always produce a `Secret` resource that is automatically
mounted to the pods of your application. 

#### Path

The secret should be available as files at

```
/var/run/secrets/nais.io/jwker
```

#### Contents

##### `JWKS`

Private JWKS, i.e. containing a JWK with the private RSA key for creating signed JWTs when [authenticating to TokenDings with a signed [`client_assertion`](#Creating a client_assertion) ].

Example value:

```json
{
  "keys": [
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
      "qi": "QCW5VQjO...",
      "x5c": [
        "MIID8jCC..."
      ],
      "x5t": "jXDxKRE6a4jogcc4HgkDq3uVgQ0",
      "x5t#S256": "AH2gbUvjZYmSQXZ6-YIRxM2YYrLiZYW8NywowyGcxp0"
    }
  ]
}
```

### Get a token from TokenDings

TokenDings will issue an `access_token` in *JWT* format based on the information provided in the token request. This token can be used as a *bearer token* when calling your target API. The two most common scenarios when requiring a token are:

* Calling an API on behalf of an enduser
* Calling an API with the identity of your application
  * For now we recommend using the `OAuth 2.0 Client Credentials` flow with Azure AD as described here [NAV specific documentation](https://security.labs.nais.io/pages/guide/maskin_til_maskin_uten_bruker.html) / [Azure AD generic documentation](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-client-creds-grant-flow#get-a-token)

#### On behalf of an enduser

Your application must take the token received from your identity provider and exchange it with a "properly scoped" token for NAV (i.e. a token intended for the app you are about to invoke). In order to do that you will have to send a token request to TokenDings containing the token you want to exchange. The following HTTP snippet shows an example:

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



| Parameter               | Value                                                    | Comment                                                      |
| ----------------------- | -------------------------------------------------------- | ------------------------------------------------------------ |
| `grant_type`            | `urn:ietf:params:oauth:grant-type:token-exchange`        | The identifier of the OAuth 2.0 grant to use, in this case the OAuth 2.0 Token Exchange grant. This grants allows applications to exchange one token for a new one containing much of the same information while still being correctly "scoped" in terms of OAuth. |
| `client_assertion_type` | `urn:ietf:params:oauth:client-assertion-type:jwt-bearer` | Identifies the type of *assertion* the client/application will use to authenticate itself to TokenDings, in this case a JWT. |
| `client_assertion`      | A serialized JWT identifying the calling app             | A JWT signed by the calling client/application, identifying itself to TokenDings. |
| `subject_token_type`    | `urn:ietf:params:oauth:token-type:jwt`                   | Identifies the type of token that will be exchanged with a new one, in this case a JWT |
| `subject_token`         | A serialized JWT, the token that should be exchanged     | The actual token (JWT) containing the signed-in user         |
| `audience`              | The identifier of the app you wish to use the token for  | Identifies the intended audience for the resulting token, i.e. the target app you request a token for. |

##### Creating a client_assertion

The `client_assertion` is a JWT signed by the application making the token request. The public key of the keypair used for signing the JWT and the `client_id` of the application must be preregistered in TokenDings. 

All applications in nais clusters containg an [access policy](../nais-application/access-policy.md) will be registered automatically when applying the application spec (handled by the k8s operator [Jwker](https://github.com/nais/jwker/)), and the respective key pairs will be made available as a k8s secrets. This secret must be used to sign the `client_assertion`.

The `client_assertion` must contain the following claims:

* the claims `sub` and `iss` should both be equal and identify the calling client/app to TokenDings, i.e. your apps `client_id` using the following naming scheme:`<cluster>:<namespace>:<appname>`
* the `aud` claim should contain the intended "audience" for the token, i.e. it should be equal to the token endpoint you are calling to get a token, for example:`https://tokendings.prod-gcp.nais.io/token`
* a unique JWT id should be provided in the claim `jti`
* Expiration claims such as `nbf`, `iat` and `exp` must be present and the **maximum lifetime** of the token cannot be more than **120** seconds

The following example shows all the required claims of a client_assertion JWT:

*Header*

```json
{
  "kid": "93ad09a5-70bc-4858-bd26-5ff4a0c5f73f",
  "typ": "JWT",
  "alg": "RS256"
}
```

*Payload*

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

### Validate a token issued from TokenDings

If your app receives a token from another application, it is your responsibility to ensure this token is valid and intended for your application.

Configure your app with the [OAuth 2.0 Authorization Server Metadata](https://www.rfc-editor.org/rfc/rfc8414.html) from the TokenDings *well-known* endpoint (TODO - describe configmap / env variables) in order to retrieve issuer name and `jwks_uri` for public keys retrieval.

#### Signature verification

- The token should be signed with the `RS256` algorithm (defined in JWT header), tokens not matching this algorithm should be rejected
- Verify that the signature is correct - keys can be retrieved by using the `kid` attribute from the token header against the issuer `jwks_uri`.

#### Claim Validation
The following claims should explicitly be validated:
- `iss` (**issuer**): The issuer of the token, the TokenDings issuer URI should match exactly
- `aud` (**audience**): The intended audience for the token, should match your applications client_id in the naming scheme `<cluster>:<namespace>:<appname>`
- `exp` (**expiration time**): Expiration time, i.e. tokens received after this date should be rejected
- `nbf` (**not before time**): The token cannot be used before this time, i.e. if the token is issued in the "future" (outside "reasonable" clock skew) it should be rejected
- `iat` (**issued at time**): The time at which the token has been issued, should be before exp
- `sub` (**subject**): If applicable, used in user centric access control

####  Example token (exchanged from IdPorten)

The following example shows the claims of a TokenDings token exchanged based on a subject_token from IDPorten:

```json
{
  "sub": "HmjqfL7....",
  "iss": "https://tokendings.prod-gcp.nais.io",
  "client_amr": "client_secret_post",
  "pid": "12345678910",
  "token_type": "Bearer",
  "client_id": "prod-gcp:team-a:app-a",
  "aud": "prod-gcp:team-b:app-b",
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


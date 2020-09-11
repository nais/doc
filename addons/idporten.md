---
description: >
  Provisioning and configuration of accompanying ID-porten clients for authentication and authorization in public facing 
  web applications.
---

# ID-porten Clients

An accompanying ID-porten Client can be automatically provisioned to your NAIS application. 

The ID-porten Client will be configured with sane defaults to enable usage in both authentication and/or authorization 
for public facing web applications.

[Digdirator] generates a Kubernetes Secret containing the values needed for your application to integrate ID-porten, 
e.g. credentials and URLs. The secret will automatically be mounted to the pods of your application during deploy.

Every deploy will trigger rotation of credentials, invalidating any jwk´s that are not in use. 
_In use_ in this context refers to all jwk´s that are currently mounted to an existing pod - 
regardless of their status (Running, CrashLoopBackOff, etc.). In other words, jwk rotation should happen
with zero downtime.

## Spec

See the [NAIS manifest](../nais-application/reference.md#spec-idporten).

## Usage

### ID-porten Client for Authentication & Authorization

Generally, the ID-porten client allows your application to leverage ID-porten for authentication and authorization.

The most common cases include:

- User (citizens) sign-in with SSO, using [OpenID Connect with Authorization Code]
- Request chains involving an end-user whose identity and permissions should be propagated through each service/web API, 
using the [OAuth 2.0 Token Exchange] -> [TokenX] 

See the [TokenX Documentation] for NAV-specific usage.

For more information about integration with provider see [ID-porten Integration guide].

### Getting Started

#### Minimal Example

The very minimal example configuration required in [`nais.yaml`](../nais-application/reference.md#spec-idporten)
to enable auto-provisioning of an ID-porten client for your application.

```yaml
apiVersion: "nais.io/v1alpha1"
kind: "Application"
metadata:
  name: nais-testapp
  namespace: aura
  labels:
    team: aura
spec:
  image: navikt/nais-testapp:66.0.0
  idporten:
    enabled: true
  # required for on-premises only
  webproxy: true
  # required for GCP only
  accessPolicy:
    outbound:
      external:
        - host: oidc-ver2.difi.no
```

This will register an ID-porten client using the following naming scheme: 
```
<cluster>:<metadata.namespace>:<metadata.name>
```

For the example above, the result would be:
```
dev-gcp:aura:nais-testapp
```

#### Full Example

```yaml
apiVersion: "nais.io/v1alpha1"
kind: "Application"
metadata:
  name: nais-testapp
  namespace: aura
  labels:
    team: aura
spec:
  image: navikt/nais-testapp:66.0.0
  idporten:
    enabled: true
    clientName: NAV - DEV
    clientURI: "https://nav.no"
    redirectURI: "https://my.application.dev.nais.io/callback"
    frontchannelLogoutURI:
      - "https://my.application.dev.nais.io/logout"
    postLogoutRedirectURIs:
      - "https://nav.no"
    # refresh token last for 6 hours
    refreshTokenLifetime: 21600
  ingresses:
    - "https://my.application"
    - "https://my.application.dev.nais.io"
  accessPolicy:
    inbound:
      rules:
        - application: app-a
          namespace: othernamespace
        - application: app-b
    # required for GCP only
    outbound:
      external:
        - host: oidc-ver2.difi.no
  # required for on-premises only
  webproxy: true
```

### Redirect URI

{% hint style="info" %}
Note that `spec.idporten.redirectURI` can be omitted if `spec.ingresses` are specified.
{% endhint %}

Each ingress specified will generate a reply URL using the formula:

```
spec.ingresses[n] + "/oauth2/callback"
```

In other words, this:

```yaml
spec:
  idporten:
    enabled: true
  ingresses:
    - "https://my.application.dev.nais.io"
```

is equivalent to this:

```yaml
spec:
  idporten:
    enabled: true
    redirectURI: "https://my.application/oauth2/callback"
  ingresses:
    - "https://my.application.dev.nais.io"
```

You may override the reply URL manually by specifying `spec.idporten.redirectURI`. 

If you for any reason have several ingresses
```yaml
spec:
  idporten:
    enabled: true
  ingresses:
    - "https://my.application.dev.nais.io"
    - "https://my.application/"
```

Specifying `spec.idporten.redirectURI` is mandatory in your nais.yml

```yaml
spec:
  idporten:
    enabled: true
    redirectURI: "https://my.application/oauth2/callback"
  ingresses:
    - "https://my.application.dev.nais.io"
    - "https://my.application/"
```

{% hint style="danger" %}
Specifying `spec.idporten.redirectURI` will replace the auto-generated redirect URI.
{% endhint %}

### Local Testing
**TODO**

### ID-porten client configuration

In most cases you will not need to manually change things for your application, as the ID-porten 
client automatically is configured with sane defaults, with most other common options 
available to be configured through [`nais.yaml`](../nais-application/reference.md#spec-idporten). 

### Runtime Configuration and Credentials

Provisioning an ID-porten client produces a `Secret` resource that is automatically
mounted to the pods of your application. 

#### Contents

The following describes the contents of the aforementioned secret.

These are available as environment variables in your pod, as well as files at the path `/var/run/secrets/nais.io/idporten`

| Name | Description |
|---|---|
| `IDPORTEN_CLIENT_ID` | ID-porten client ID. Unique ID for the application in ID-porten |
| `IDPORTEN_CLIENT_JWK` | Private JWKS, i.e. containing a JWK with the private RSA key for creating signed JWTs when [authenticating to ID-porten with a JWT grant]. This will always contain a single key, i.e. the newest key registered |
| `IDPORTEN_REDIRECT_URI` | Configured or generated redirect URI, witch is a valid url that the provider can redirect back to |
| `IDPORTEN_WELL_KNOWN_URL` | The well-known URL with the environment, dev: `oidc-ver2.difi.no`, prod: `oidc.difi.no`, for which the ID-porten client resides in |

#### Example reference `Secret` resource

This is automatically generated and mounted into your pod as environment variables and files. See the table above.

```yaml
---
apiVersion: v1
kind: Secret
metadata:
  name: <application-name>-<random-string>
  namespace: aura
  labels:
    team: aura
data:
  IDPORTEN_CLIENT_ID: e89006c5-7193-4ca3-8e26-d0990d9d981f
  IDPORTEN_CLIENT_JWK: |
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
  IDPORTEN_REDIRECT_URI: https://my.application/callback
  IDPORTEN_WELL_KNOWN_URL: https://oidc-ver2.difi.no/idporten-oidc-provider/.well-known/openid-configuration
```

## JWT as authentication method
Provisioning of ID-porten client defaults to `private_key_jwt` as client authentication method [OpenID Connect Core 1.0, 9. Client Authentication].
Application `grant_type` (or flows) are methods your application use in order to obtain Access Tokens from ID-porten: `grant_type` -> `urn:ietf:params:oauth:grant-type:jwt-bearer`.

Make sure to set `aud` value explicit to `issuer` found in [ID-porten well-known]. 

For more details about ID-porten and JWT, see the [JWT grant documentation, same as for Maskinporten].

The final JWT created and send to ID-porten may look like this:

```json
{
  "kid": "225ed7ac-33eb-4ce3-bc86-6af40e56868f",
  "alg": "RS256"
}
.
{
  "aud": "https://oidc-ver2.difi.no/idporten-oidc-provider/",
  "scope": "openid",
  // your application client_id found in `Secret` resource
  "iss": "e89006c5-7193-4ca3-8e26-d0990d9d981f",
  "exp": 1520589928,
  "iat": 1520589808,
  "jti": "415ec7ac-33eb-4ce3-bc86-6ad40e29768f"
}
.
<<signature-value>>
```

## Migrating from existing infrastructure-as-code ([IaC]) solution

### Why migrate?

For the same reason as for Azure AD Application:

- Declarative provisioning, straight from your application's [`nais.yaml`](../nais-application/reference.md#spec-idporten)
- No longer dependent on manual user approvals in multiple IaC repositories
- No longer dependent on Vault
- Credentials are rotated on _every_ deploy, completely transparent to the application. 
This ensures that credentials are fresh and lessens the impact in the case of exposure.
- The exact same feature is present in the [GCP](../clusters/gcp.md) clusters, 
which simplifies [migration](../clusters/migrating-to-gcp.md).

### Differences

In general, the ID-porten client provisioned through NAIS are entirely new, unique instances with new client IDs 
and should be treated as such.

### Migrating - step-by-step

#### 1. Give your application a new description in the [IaC]

In order for NAIS -> [Digdirator] to pick up and update your ID-porten client, the **`description`** of the client registered in 
the [IaC] should match the expected format:

```
<cluster>:<namespace>:<app-name>
```

E.g.

```
dev-gcp:aura:my-app
```

Make sure that you are aware of and configure if necessary the value of `spec.idporten.redirectURI`. As redirectURI
will be generated in this form: `https://my.application.ingress/oauth2/callback`

Take also in consideration to set other values explicit in [`nais.yaml`](../nais-application/reference.md#spec-idporten) 
as [Digdirator] overrides existing one:
`spec.idporten.clientName`
`spec.idporten.refreshTokenLifetime`
`spec.idporten.clientURI`
`spec.idporten.redirectURI`
`spec.idporten.frontchannelLogoutURI[]`
`spec.idporten.postLogoutRedirectURIs[]`

## Deletion

The ID-porten client is automatically deleted whenever the associated Application resource is deleted. 
In other words, if you delete your NAIS application the ID-porten client is also deleted. This will result in
a **_new and different_** client ID in ID-porten if you re-create the application after deletion.

[OAuth 2.0 Token Exchange]: https://www.rfc-editor.org/rfc/rfc8693.html
[TokenX Documentation]: ../addons/tokenx.md
[ID-porten Integration guide]: https://difi.github.io/felleslosninger/oidc_guide_idporten.html
[OpenID Connect with Authorization Code]: https://difi.github.io/felleslosninger/oidc_protocol_token.html
[authenticating to ID-porten with a JWT grant]: https://difi.github.io/felleslosninger/oidc_protocol_jwtgrant.html
[JWT grant documentation, same as for Maskinporten]: https://difi.github.io/felleslosninger/maskinporten_protocol_jwtgrant.html
[ID-porten well-known]: https://oidc-ver2.difi.no/idporten-oidc-provider/.well-known/openid-configuration
[OpenID Connect Core 1.0, 9. Client Authentication]: http://openid.net/specs/openid-connect-core-1_0.html#ClientAuthentication
[IaC]: https://github.com/navikt/nav-maskinporten/tree/master/clients
[Digdirator]: https://github.com/nais/digdirator
---
description: >
  Provisioning and configuration of accompanying ID-porten clients for authentication and authorization in public-facing 
  web applications.
---

# ID-porten Clients

{% hint style="warning" %}
**Status: Opt-In Open Beta in dev-gcp**

This feature is currently only available in the [GCP](../../clusters/gcp.md) clusters.
{% endhint %}

ID-porten is a common log-in system used for logging into Norwegian public e-services for citizens. 
The NAIS platform offers a simple way of provisioning and configuring an accompanying 
[ID-porten client](https://difi.github.io/felleslosninger/oidc_index.html) that your application may use to integrate with ID-porten.

The ID-porten Client will be configured with sane defaults to enable usage in both authentication and/or authorization 
for public-facing web applications.

[Digdirator] generates a Kubernetes Secret containing the values needed for your application to integrate ID-porten, 
e.g. credentials and URLs. The secret will automatically be mounted to the pods of your application during deploy.

Every deploy will trigger rotation of credentials, invalidating any JWKs that are not in use. 
_In use_ in this context refers to all jwk´s that are currently mounted to an existing pod - 
regardless of their status (Running, CrashLoopBackOff, etc.). In other words, JWK rotation should happen
with zero downtime.

## Spec

See the [NAIS manifest](../../nais-application/reference.md#spec-idporten).

## Usage

### Authentication & Authorization

The ID-porten client allows your application to leverage ID-porten for authentication and authorization of citizen 
end-users, providing sign-in capabilities with SSO. To do this, your application must thus implement 
[OpenID Connect with Authorization Code] flow.

This is also a critical first step in request chains involving an end-user whose identity and permissions should be 
propagated through each service/web API when accessing services in NAV, the process of which involves using the 
[OAuth 2.0 Token Exchange] protocol. See the [TokenX Documentation] for details.

Refer to the [ID-porten Integration guide] for further details.

### Getting Started

#### Minimal Example

Minimal example configuration required in [`nais.yaml`](../../nais-application/reference.md#spec-idporten)
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

#### Full Example

See the [NAIS manifest](../../nais-application/reference.md#spec-idporten) for details of all the fields used below.

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
    clientURI: "https://nav.no"
    redirectURI: "https://my.application.dev.nais.io/callback"
    frontchannelLogoutURI: "https://my.application.dev.nais.io/logout" 
    postLogoutRedirectURIs:
      - "https://nav.no"
    refreshTokenLifetime: 21600 # lifetime of refresh tokens in seconds - 6 hours
  ingresses:
    - "https://my.application.dev.nais.io"
  accessPolicy:
    # required for GCP only
    outbound:
      external:
        - host: oidc-ver2.difi.no
  # required for on-premises only
  webproxy: true
```

### Redirect URI

{% hint style="danger" %}
For security reasons you may only specify **one** ingress when this feature is enabled.
{% endhint %}

The ingress specified will by default generate a redirect URL using the formula:

```
spec.ingresses[0] + "/oauth2/callback"
```

In other words, this:

```yaml
spec:
  idporten:
    enabled: true
  ingresses:
    - "https://my.application.dev.nais.io"
```

will generate a spec equivalent to this:

```yaml
spec:
  idporten:
    enabled: true
    redirectURI: "https://my.application.dev.nais.io/oauth2/callback"
  ingresses:
    - "https://my.application.dev.nais.io"
```

{% hint style="warning" %}
You may override the redirect URL manually by specifying `spec.idporten.redirectURI`, however it must be a valid subpath
of your application's specified ingress. 

Specifying `spec.idporten.redirectURI` will replace the auto-generated redirect URI.
{% endhint %}

### ID-porten client configuration

In most cases you will not need to manually change things for your application, as the ID-porten 
client automatically is configured with sane defaults, with most other common options 
available to be configured through [`nais.yaml`](../../nais-application/reference.md#spec-idporten). 

### Runtime Configuration and Credentials

Provisioning an ID-porten client produces a `Secret` resource that is automatically
mounted to the pods of your application. 

#### Contents

The following describes the contents of the aforementioned secret.

These are available as environment variables in your pod, as well as files at the path `/var/run/secrets/nais.io/idporten`

| Name | Description |
|---|---|
| `IDPORTEN_CLIENT_ID` | ID-porten client ID. Unique ID for the application in ID-porten |
| `IDPORTEN_CLIENT_JWK` | Private JWK containing the private RSA key for creating signed JWTs when [authenticating to ID-porten with a JWT grant]. |
| `IDPORTEN_REDIRECT_URI` |  The redirect URI registered for the client at ID-porten. This must a valid URI for the application where the user is redirected back to after successful authentication and authorization. |
| `IDPORTEN_WELL_KNOWN_URL` | The well-known URL for the OIDC metadata discovery document where the client is registered. |

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

## Client Authentication to ID-porten

For security reasons, clients provisioned through NAIS may only use client assertions during client authentication to
ID-porten. That is, `private_key_jwt` is the only accepted authentication method for the client 
(see [OpenID Connect Core 1.0, 9. Client Authentication]). To perform this authentication,
you'll have to create a client assertion.

### Creating a Client Assertion

The `client_assertion` is a JWT signed by the application making the token request. 
The public key of the keypair used for signing the JWT and the `client_id` of the application is automatically 
registered at ID-porten by NAIS when using this feature.

* `client_id` is available as an environment variable `IDPORTEN_CLIENT_ID`
* The private part of the keypair is available as a JWK in the environment variable `IDPORTEN_CLIENT_JWK`

The `client_assertion` must contain the following claims:

* the `iss` claim should identify the calling client/app to ID-porten, i.e. the `client_id`
* the `aud` claim should contain the intended "audience" for the token, i.e. for ID-porten it should be equal to the 
issuer of the authorization server, for example: `https://oidc.difi.no/idporten-oidc-provider/`
* the `jti` claim should contain a unique ID for the JWT, for example a UUID
* expiration claims such as `iat` and `exp` must be present and the **maximum lifetime** of the token cannot be more than **120** seconds

The final JWT assertion created and sent to ID-porten may look like this:

#### Header

- `kid` is the key ID retrieved from the your client's JWK, found in the [associated secret](#runtime-configuration-and-credentials) at `IDPORTEN_CLIENT_JWK`.

```json
{
  "kid": "225ed7ac-33eb-4ce3-bc86-6af40e56868f",
  "alg": "RS256"
}
```

#### Body

- `iss` is found in the [associated secret](#runtime-configuration-and-credentials) at `IDPORTEN_CLIENT_ID`
- `aud` is as described earlier the `issuer` found in the ID-porten metadata discovery document at `IDPORTEN_WELL_KNOWN_URL`

```json
{
  "aud": "https://oidc-ver2.difi.no/idporten-oidc-provider/",
  "scope": "openid",
  "iss": "e89006c5-7193-4ca3-8e26-d0990d9d981f",
  "exp": 1520589928,
  "iat": 1520589808,
  "jti": "415ec7ac-33eb-4ce3-bc86-6ad40e29768f"
}
```

{% hint style="info" %}
**Example**

The demo app [frontend-dings] demonstrates login using ID-porten and calling an API with a properly scoped token using 
[TokenX][TokenX Documentation]
{% endhint %}


## Test users for development

ID-porten maintains a public list of test users found [here][idporten-testusers].

## Migrating from existing infrastructure-as-code ([IaC]) solution

### Why migrate?

- Declarative provisioning, straight from your application's [`nais.yaml`](../../nais-application/reference.md#spec-idporten)
- No longer dependent on manual user approvals in multiple IaC repositories
- No longer dependent on Vault
- Credentials are rotated on _every_ deploy, completely transparent to the application. 
This ensures that credentials are fresh and lessens the impact in the case of exposure.

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

Make sure to explicitly configure any values in [`nais.yaml`](../../nais-application/reference.md#spec-idporten) 
that you wish to keep for your existing client.

## Deletion

The ID-porten client is automatically deleted whenever the associated Application resource is deleted. 
In other words, if you delete your NAIS application the ID-porten client is also deleted. This will result in
a **_new and different_** client ID in ID-porten if you re-create the application after deletion.

[OAuth 2.0 Token Exchange]: https://www.rfc-editor.org/rfc/rfc8693.html
[TokenX Documentation]: tokenx.md
[ID-porten Integration guide]: https://difi.github.io/felleslosninger/oidc_guide_idporten.html
[OpenID Connect with Authorization Code]: https://difi.github.io/felleslosninger/oidc_protocol_token.html
[OpenID Connect Core 1.0, 9. Client Authentication]: http://openid.net/specs/openid-connect-core-1_0.html#ClientAuthentication
[IaC]: https://github.com/navikt/nav-maskinporten/tree/master/clients
[Digdirator]: https://github.com/nais/digdirator
[frontend-dings]: https://github.com/nais/frontend-dings
[idporten-testusers]: https://difi.github.io/felleslosninger/idporten_testbrukere.html

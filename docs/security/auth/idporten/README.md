---
description: Enabling public-facing authentication using ID-porten.
---

# ID-porten

!!! warning "Forthcoming changes in 2022-2023"
    ID-porten is currently undergoing some [changes](https://docs.digdir.no/oidc_protocol_nye_idporten.html). These changes will roll out in 2022-2023.
    
    TL;DR:

    1. new URL and issuer
    2. [PKCE](https://oauth.net/2/pkce/), state and nonce is required for Authorization Code Flow
    3. the contents of the `sub` claim will likely change
    
    You will likely only need to worry about 2. if you're implementing a client on your own and 3. if you're using the `sub` claim.

## Abstract

!!! abstract
    ID-porten is a common log-in system used for logging into Norwegian public e-services for citizens.

    The NAIS platform provides support for simple, declarative provisioning of an [ID-porten client](https://docs.digdir.no/oidc_index.html) with sensible defaults that your application may use to integrate with ID-porten.

    An ID-porten client allows your application to leverage ID-porten for authentication of citizen end-users, providing sign-in capabilities with single sign-on \(SSO\). To achieve this, your application must implement [OpenID Connect with the Authorization Code](https://docs.digdir.no/oidc_guide_idporten.html) flow.

    This is also a critical first step in request chains involving an end-user whose identity and permissions should be propagated through each service/web API when accessing services in NAV using the [OAuth 2.0 Token Exchange](https://www.rfc-editor.org/rfc/rfc8693.html) protocol. See the [TokenX documentation](../tokenx.md) for details.

!!! warning
    - [ ] Please ensure that you have read the [ID-porten integration guide](https://docs.digdir.no/oidc_guide_idporten.html).
    - [ ] If you're implementing your own client, you **must** perform the [verification tests](https://docs.digdir.no/docs/idporten/idporten/idporten_verifikasjonstester) to ensure that your integration works as expected.
    - [ ] We **strongly** recommend that you use the [sidecar](sidecar.md) instead of implementing a client on your own.

## Configuration

### Getting Started
=== "nais.yaml"
    ```yaml
    spec:
      idporten:
        enabled: true

        # optional, default shown
        clientURI: "https://nav.no"

        # optional, default shown
        redirectPath: "/oauth2/callback"

        # optional, default shown
        frontchannelLogoutPath: "/oauth2/logout"

        # optional, defaults shown
        postLogoutRedirectURIs: 
          - "https://nav.no"

        # optional, in seconds - defaults shown (1 hour)
        accessTokenLifetime: 3600

        # optional, in seconds - defaults shown (2 hours)
        sessionLifetime: 7200

      # required for on-premises only
      webproxy: true
    ```

### Spec

See the [NAIS manifest](../../../nais-application/application.md#idporten).

### Access Policies

ID-porten is a third-party service outside of our clusters, which is not reachable by default like most third-party services.

#### Google Cloud Platform \(GCP\)

The following [outbound external hosts](../../../nais-application/access-policy.md#external-services) are automatically added when enabling this feature:

* `oidc-ver2.difi.no` in development
* `oidc.difi.no` in production

You do not need to specify these explicitly.

#### On-premises

You must enable and use [`webproxy`](../../../nais-application/application.md#webproxy) for external communication.

### Ingresses

!!! danger
    You may only specify **one** ingress when this feature is enabled.

### Redirect URI

The redirect URI is the fully qualified URI that ID-porten redirects back to after a successful authorization request.

NAIS will automatically infer the complete redirect URI to be registered at ID-porten using the scheme:
```
spec.ingresses[0] + spec.idporten.redirectPath
```

where `spec.idporten.redirectPath` has a default value of `/oauth2/callback`.

E.g.

```
https://my.application.ingress/oauth2/callback
```

If you wish to use a different path than the default, you may do so by manually specifying `spec.idporten.redirectPath`.

## Logout

!!! danger
    When integrating with ID-porten, you are **required** to correctly implement proper logout functionality.
    Refer to the [documentation at DigDir](https://docs.digdir.no/oidc_func_sso.html) for further details.

### Self-initiated Logout

[When logout is initiated from your client](https://docs.digdir.no/oidc_func_sso.html#1-utlogging-fra-egen-tjeneste), you must redirect the given user to ID-porten's `endsession`-endpoint.

ID-porten will then log the user out from all other services connected to the same single sign-on session.

If the optional parameters `id_token_hint` and `post_logout_redirect_uri` are set in the request, ID-porten will redirect the user to the specified URI given that the URI is registered for the client. 

### Front-channel Logout

[Front-channel logouts](https://docs.digdir.no/oidc_func_sso.html#2-h%C3%A5ndtere-utlogging-fra-id-porten) are logouts initiated by _other_ ID-porten clients. 

When the user logs out from another ID-porten application, ID-porten will trigger a `GET` request from the user's user-agent (browser) to `frontchannel_logout_uri` via an iframe.
This request includes two parameters:

- `iss` which denotes the _issuer_ for the Identity Provider
- `sid` which denotes the user's associated session ID at ID-porten which is set in the `sid` claim in the user's `id_token`

In short, when receiving such a request you are obligated to clear the local session for your application for the given user's `sid` so that the user is properly logged out across all services in the circle-of-trust.

!!! danger "Here be dragons!"
    In order for single logout to work properly across all SSO services, all ID-porten clients **must** properly implement an endpoint that destroys the user's session on front-channel logouts.
    
    Do not rely on cookies. They will likely not be sent with the iframe request from the user's browser due to the request being cross-domain and `SameSite` not being handled consistently by all browsers.
    This means that attempting to clear any session cookies when receiving such requests will fail.
    
    The **only** reliable indicator of the user's session ID is the `sid` parameter. This also means that you likely need a server-side session storage (such as Redis) in order to revoke the session.

Your application's `frontchannel_logout_uri` is by default automatically inferred by NAIS and registered at ID-porten using the following scheme:

```
spec.ingresses[0] + spec.idporten.frontchannelLogoutPath
```

where `spec.idporten.frontchannelLogoutPath` has a default value of `/oauth2/logout`.

E.g.

```
https://my.application.ingress/oauth2/logout
```

If you wish to use a different path than the default, you may do so by manually specifying `spec.idporten.frontchannelLogoutPath`.

## Usage

### Client Authentication

All ID-porten clients in NAV **must** use [client assertions](../concepts/actors.md#client-assertion) when 
authenticating itself with ID-porten. In order to perform this client authentication, you must first 
[create a client assertion](https://docs.digdir.no/docs/idporten/oidc/oidc_protocol_token#client-authentication-using-jwt-token)
as specified by ID-porten.

Notes:

- Set the **`kid`** header claim. The value for this is found in the [private JWK](../concepts/cryptography.md#private-keys) belonging to your client, i.e. `IDPORTEN_CLIENT_JWK`. This JWK must also be used to sign the JWT grant.
- Do not set the `x5c` header claim.
- Ensure that the **`aud`** claim is equal to the **`issuer`** value found in the [metadata/discovery document](https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderMetadata) (hosted at `IDPORTEN_WELL_KNOWN_URL`)

### Runtime Variables & Credentials

The following environment variables and files \(under the directory `/var/run/secrets/nais.io/idporten`\) are available at runtime:

---

#### `IDPORTEN_CLIENT_ID`

???+ note

    [Client ID](../concepts/actors.md#client-id) that uniquely identifies the application in ID-porten.

    Example value: `e89006c5-7193-4ca3-8e26-d0990d9d981f`

---

#### `IDPORTEN_CLIENT_JWK`

???+ note

    [Private JWK](../concepts/cryptography.md#private-keys) containing an RSA key belonging to your client. Used to sign client assertions during [client authentication](#client-authentication).

    ```javascript
    {
      "use": "sig",
      "kty": "RSA",
      "kid": "jXDxKRE6a4jogcc4HgkDq3uVgQ0",
      "alg": "RS256",
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

---

#### `IDPORTEN_REDIRECT_URI`

???+ note

    The redirect URI registered for the client at ID-porten. This must be a valid URI for the application where the user is redirected back to after successful authentication and authorization.
    
    Example value: `https://my.application.dev.nav.no/callback` 

---

#### `IDPORTEN_WELL_KNOWN_URL`

???+ note

    The well-known URL for the [OIDC metadata discovery document](../concepts/actors.md#well-known-url-metadata-document) for ID-porten.

    Example value: `https://oidc-ver2.difi.no/idporten-oidc-provider/.well-known/openid-configuration`

---

#### `IDPORTEN_ISSUER`

???+ note

    `issuer` from the [metadata discovery document](../concepts/actors.md#issuer).

    Example value: `https://oidc-ver2.difi.no/idporten-oidc-provider/`

---

#### `IDPORTEN_JWKS_URI`

???+ note

    `jwks_uri` from the [metadata discovery document](../concepts/actors.md#jwks-endpoint-public-keys).

    Example value: `https://oidc-ver2.difi.no/idporten-oidc-provider/jwk`

---

#### `IDPORTEN_TOKEN_ENDPOINT`

???+ note

    `token_endpoint` from the [metadata discovery document](../concepts/actors.md#token-endpoint).

    Example value: `https://oidc-ver2.difi.no/idporten-oidc-provider/token`

---
description: Enabling public-facing authentication using ID-porten.
---

# ID-porten

!!! warning "Status: Opt-In Open Beta"
    This feature is only available in [team namespaces](../../clusters/team-namespaces.md)

## Abstract

!!! abstract
    ID-porten is a common log-in system used for logging into Norwegian public e-services for citizens.

    The NAIS platform provides support for simple, declarative provisioning of an [ID-porten client](https://docs.digdir.no/oidc_index.html) with sensible defaults that your application may use to integrate with ID-porten.

    An ID-porten client allows your application to leverage ID-porten for authentication of citizen end-users, providing sign-in capabilities with single sign-on \(SSO\). To achieve this, your application must implement [OpenID Connect with the Authorization Code](https://docs.digdir.no/oidc_guide_idporten.html) flow.

    This is also a critical first step in request chains involving an end-user whose identity and permissions should be propagated through each service/web API when accessing services in NAV using the [OAuth 2.0 Token Exchange](https://www.rfc-editor.org/rfc/rfc8693.html) protocol. See the [TokenX documentation](tokenx.md) for details.

!!! info
    **See the** [**NAV Security Guide**](https://security.labs.nais.io/) **for NAV-specific usage of this client.**
    
!!! warning
    Please ensure that you have read the [ID-porten Integration guide](https://docs.digdir.no/oidc_guide_idporten.html).

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
    ```

### Spec

See the [NAIS manifest](../../nais-application/nais.yaml/reference.md#specidporten).

### Access Policies

The following [outbound external hosts](../../nais-application/access-policy.md#external-services) are automatically added when enabling this feature:

* `oidc-ver2.difi.no` in development
* `oidc.difi.no` in production

You do not need to specify these explicitly.

### Ingresses

!!! danger
    For security reasons you may only specify **one** ingress when this feature is enabled.

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

### Logout URIs

!!! warning
    When integrating with ID-porten, you are **required** to correctly implement proper logout functionality.
    Refer to the [documentation at DigDir](https://docs.digdir.no/oidc_func_sso.html) for further details.

#### Self-initiated Logout

[When logout is initiated from your client](https://docs.digdir.no/oidc_func_sso.html#1-utlogging-fra-egen-tjeneste), you must redirect the given user to ID-porten's `endsession`-endpoint.

ID-porten will then log the user out from all other services connected to the same single sign-on session.

If the optional parameters `id_token_hint` and `post_logout_redirect_uri` are set in the request, ID-porten will redirect the user to the specified URI given that the URI is registered for the client. 

#### Front-channel Logout

[Front-channel logouts](https://docs.digdir.no/oidc_func_sso.html#2-h%C3%A5ndtere-utlogging-fra-id-porten) are logouts initiated by _other_ ID-porten clients. 

Your application will receive a `GET` request from ID-porten at `frontchannel_logout_uri`. 
This request includes two parameters:
- `iss` which denotes the _issuer_ for the Identity Provider
- `sid` which denotes the user's associated session ID at ID-porten which is set in the `sid` claim in the user's `id_token`

In short, when receiving such a request you are obligated to clear the local session for your application for the given user's `sid` so that the user is properly logged out across all services in the circle-of-trust.

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

!!! info
    **See the** [**NAV Security Guide**](https://security.labs.nais.io/) **for NAV-specific usage.**

### Runtime Variables & Credentials

The following environment variables and files \(under the directory `/var/run/secrets/nais.io/idporten`\) are available at runtime:

???+ example "`IDPORTEN_CLIENT_ID`"

    ID-porten client ID. Unique ID for the application in ID-porten.

    Example value: `e89006c5-7193-4ca3-8e26-d0990d9d981f`

???+ example "`IDPORTEN_CLIENT_JWK`"

    Private JWK containing the private RSA key for creating signed JWTs when [authenticating to ID-porten with a JWT grant](https://docs.digdir.no/oidc_protocol_token.html#client-authentication-using-jwt-token).

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

???+ example "`IDPORTEN_REDIRECT_URI`"

    The redirect URI registered for the client at ID-porten. This must be a valid URI for the application where the user is redirected back to after successful authentication and authorization.
    
    Example value: `https://my.application.dev.nav.no/callback` 

???+ example "`IDPORTEN_WELL_KNOWN_URL`"

    The well-known URL for the OIDC metadata discovery document for ID-porten.

    Example value: `https://oidc-ver2.difi.no/idporten-oidc-provider/.well-known/openid-configuration`

### Test Users for Logins

ID-porten maintains a public list of test users found [here](https://docs.digdir.no/idporten_testbrukere.html).

## Internals

This section is intended for readers interested in the inner workings of this feature.

Provisioning is handled by [Digdirator](https://github.com/nais/digdirator) - a Kubernetes operator that watches a [custom resource](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/) \(called `IDPortenClient`\) that we've defined in our clusters.

Digdirator generates a Kubernetes Secret containing the values needed for your application to integrate with ID-porten, e.g. credentials and URLs. This secret will be mounted to the pods of your application during deploy.

Every deploy will trigger rotation of credentials, invalidating any credentials that are not in use. _In use_ in this context refers to all credentials that are currently mounted to an existing pod - regardless of their status \(`Running`, `CrashLoopBackOff`, etc.\). In other words, credential rotation should happen with zero downtime.

More details in the [Digdirator](https://github.com/nais/digdirator) repository.


---
description: Automatic authentication, token validation, and login/logout for ID-Porten
---

# ID-porten sidecar

!!! warning "Status: Alpha"
    This feature is only available in [team namespaces](../../../clusters/team-namespaces.md)

    **Experimental**: subject to API change, instability, or removal.

## Description

A reverse proxy that automatically handles of ID-porten login, logout, and front-channel logout.

!!! info "Prerequisite"
    **Ensure that you first [enable ID-porten for your application](README.md).**

All HTTP requests to the application will be intercepted by a sidecar ("_wonderwall_").

If the user does _not_ have a valid local session with the sidecar, the request will be proxied as-is without 
modifications to the application container.

In order to obtain a local session, the user must be redirected to the `/oauth2/login` endpoint, which performs the
[OpenID Connect Authorization Code Flow as specified by ID-porten](https://docs.digdir.no/oidc_guide_idporten.html).
Tokens acquired from this flow are validated and verified according to the specifications. 

If the user successfully completed the login flow, a session is established with the sidecar. All requests that are 
forwarded to the application container will now contain an `Authentication` header with the user's access token from ID-porten:

```
Authentication: Bearer JWT_ACCESS_TOKEN
X-Pwned-By: wonderwall
```

## Spec

=== "nais.yaml"
    ```yaml
    spec:
      idporten:
        sidecar:
          enabled: true
          level: Level4
    ```

See the [NAIS manifest](../../../nais-application/application.md#idportensidecar).

## Endpoints

The sidecar provides these endpoints under `https://app.ingress`:

* `/oauth2/login` redirects the user to ID-porten to perform the OpenID Connect Authorization Code Flow.
* `/oauth2/callback` handles callbacks from ID-porten as part of the OpenID Connect Authorization Code Flow.
* `/oauth2/logout` implements [self-initiated logout](README.md#self-initiated-logout).
* `/oauth2/logout/frontchannel` implements [front-channel logout](README.md#front-channel-logout).

## Usage

### Authenticate a user

When you must authenticate a user, redirect to `https://app.ingress/oauth2/login`.

### Redirect after authentication

Redirects after successful authentication follow these rules in ascending priority:

1. `/` (default).
2. The URL set in the `Referer` header.
3. The URL or relative path set in the query parameter `redirect`, e.g. `https://app.ingress/oauth2/login?redirect=/some/path`.

The host and scheme (if provided) are stripped from the redirect URL, which effectively only allows 
redirects to paths within your own ingress.

### Security Levels

ID-porten supports [different levels of security](https://eid.difi.no/en/security-and-cookies/different-levels-security)
when authenticating users. 
This is sent as the `acr_values` parameter to the [`/authorize` endpoint](https://docs.digdir.no/oidc_protocol_authorize.html).
Valid values are `Level3` or `Level4`.

You can set a default value for _all_ requests by specifying [`spec.idporten.sidecar.level`](../../../nais-application/application.md#idportensidecarlevel). 
**If unspecified, the sidecar use `Level4` as the default value.**

For fine-grained control of the value, set the query parameter `level` when redirecting the user to login:

```
https://app.ingress/oauth2/login?level=Level4
```

### Calling downstream APIs

The ID-porten access token can be exchanged for a [TokenX](../tokenx.md) token. 
The TokenX token can then be used when calling downstream APIs.

## Responsibilities and Guarantees

The following describes the contract for usage of the sidecar.

**The sidecar guarantees the following:**

* The `Authentication` header is added to the original request if the user has a valid session.
* The `Authentication` header is removed from the original request if the user _does not_ have a valid session.
* All HTTP requests to the `/oauth2` endpoints [defined above](#endpoints) are owned by the sidecar and will never be forwarded to the application.
* The sidecar is safe to enable and use with multiple replicas of your application.

**The sidecar does _not_ guarantee the following:**

* Automatic refresh of the user's tokens. 
* Highly available session store.
    * It currently connects and persists session data to an automatically provisioned Redis instance that runs with a single replica.
* Secure your application's endpoints.
* Validity of the user's access token. The token may be expired by the time your application receives it.

**Your application should:**

* Secure its own endpoints.
* Validate the claims and signature for the ID-porten `access_token` attached by the sidecar.
    * That is, validate the standard claims such as `iss`, `iat`, `exp`.
    * Note that the `aud` claim is _not_ set for ID-porten access tokens.
      You should instead validate that the `client_id` claim has a value equal to your ID-porten client ID.
    * Validate that the `acr` claim exists and that the set level matches the desired [security level](#security-levels) for your endpoints.

---
description: Reverse-proxy that handles automatic authentication and login/logout flows for ID-porten.
---

# ID-porten sidecar

!!! warning "Status: Beta"
    This feature is only available in the [GCP clusters](../../../clusters/gcp.md).

    **Experimental**: users report that this component is working, but it needs a broader audience to be battle-tested properly.

    Report any issues to the #nais channel on Slack.

## Description

A reverse proxy that automatically handles of ID-porten login, logout, and front-channel logout.

!!! info "Prerequisite"
    **Ensure that you first [enable ID-porten for your application](README.md).**

All HTTP requests to the application will be intercepted by a sidecar ("_wonderwall_").

If the user does _not_ have a valid local session with the sidecar, the request will be proxied as-is without 
modifications to the application container.

In order to obtain a local session, the user must be redirected to the `/oauth2/login` endpoint, which performs the
[OpenID Connect Authorization Code Flow as specified by ID-porten](https://docs.digdir.no/oidc_guide_idporten.html).

If the user successfully completed the login flow, a session is established with the sidecar. All requests that are 
forwarded to the application container will now contain an `Authorization` header with the user's `access_token` from ID-porten,
in addition to an `X-Wonderwall-ID-Token` header which contains the `id_token`.

```
Authorization: Bearer JWT_ACCESS_TOKEN
X-Wonderwall-ID-Token: JWT_ID_TOKEN
```

Only the `id_token` acquired from this flow is validated and verified by the sidecar in accordance with the
[OpenID Connect specifications](https://openid.net/specs/openid-connect-core-1_0.html#IDTokenValidation). 
**Your application is [responsible](#responsibilities-and-guarantees) for validating the `access_token`.**

## Spec

!!! danger "Port Configuration"
    The sidecar will occupy and use the ports `7564` and `7565`.

    Ensure that you do **not** bind to these ports from your application as they will be overridden.

=== "nais.yaml"
    ```yaml
    spec:
      idporten:
        sidecar:
          enabled: true
          level: Level4
          locale: nb
          autoLogin: false
          errorPath: ""
    ```

See the [NAIS manifest](../../../nais-application/application.md#idportensidecar).

## Endpoints

The sidecar provides these endpoints under `https://app.ingress`:

* `/oauth2/login` redirects the user to ID-porten to perform the OpenID Connect Authorization Code Flow.
* `/oauth2/callback` handles callbacks from ID-porten as part of the OpenID Connect Authorization Code Flow.
* `/oauth2/logout` implements [self-initiated logout](README.md#self-initiated-logout).
* `/oauth2/logout/frontchannel` implements [front-channel logout](README.md#front-channel-logout).

## Usage

### Overview

The contract for usage of the sidecar is fairly simple. For any endpoint that requires authentication:

- Validate the `Authorization` header as specified in the [responsibilities section](#your-application).
- If the `Authorization` header is missing, redirect the user to the [login endpoint](#authenticate-a-user). 
- If the JWT `access_token` in the `Authorization` header is invalid or expired, redirect the user to the [login endpoint](#authenticate-a-user).
- If you need to log out a user, redirect the user to the [logout endpoint](#logout).

!!! example
    See <https://github.com/nais/wonderwalled> for an example application that does this.

### Login

#### Authenticate a user

When you must authenticate a user, redirect to the user to:

```
https://app.ingress/oauth2/login
```

#### Redirect after authentication

Redirects after successful authentication follow these rules in ascending priority:

1. `/` (default).
2. The URL set in the `Referer` header.
3. The URL or relative path set in the query parameter `redirect`, e.g:
   
```
https://app.ingress/oauth2/login?redirect=/some/path
```

The host and scheme (if provided) are stripped from the redirect URL, which effectively only allows 
redirects to paths within your own ingress.

#### Security Levels

ID-porten supports [different levels of security](https://eid.difi.no/en/security-and-cookies/different-levels-security)
when authenticating users. 
This is sent by the sidecar as the `acr_values` parameter to the [`/authorize` endpoint](https://docs.digdir.no/oidc_protocol_authorize.html).

Valid values are `Level3` or `Level4`.

You can set a default value for _all_ requests by specifying [`spec.idporten.sidecar.level`](../../../nais-application/application.md#idportensidecarlevel). 
**If unspecified, the sidecar will use `Level4` as the default value.**

For runtime control of the value, set the query parameter `level` when redirecting the user to login:

```
https://app.ingress/oauth2/login?level=Level4
```

#### Locales

ID-porten supports a few different locales for the user interface during authentication. 
This is sent by the sidecar as the `ui_locales` parameter to the [`/authorize` endpoint](https://docs.digdir.no/oidc_protocol_authorize.html).

Valid values shown below:

| Value | Description       |
| :---- | :---------------- |
| `nb`  | Norwegian Bokmål  |
| `nn`  | Norwegian Nynorsk |
| `en`  | English           |
| `se`  | Sámi              |

You can set a default value for _all_ requests by specifying [`spec.idporten.sidecar.locale`](../../../nais-application/application.md#idportensidecarlocale).
**If unspecified, the sidecar will use `nb` as the default value.**

For runtime control of the value, set the query parameter `locale` when redirecting the user to login:

```
https://app.ingress/oauth2/login?locale=en
```

#### Auto Login

If you want _all_ routes to your application to require an authenticated session, you can enable auto-login
by setting the `.spec.idporten.sidecar.autoLogin` field to `true`.
This will make the sidecar automatically redirect
any user to login when attempting to browse to any path for your application. You should still validate and check the
`Authorization` header and the token within as specified in [responsibilitites and guarantees](#responsibilities-and-guarantees).

### Logout

When you must log a user out, redirect to the user to:

```
https://app.ingress/oauth2/logout
```

The user's session with the sidecar will be cleared, and the user will be redirected to ID-porten for global logout.

#### Redirect after logout

After the user is successfully logged out at ID-porten, the user may be redirected to another URI.

By default, the sidecar will indicate to ID-porten that the user should be redirected to `https://www.nav.no`.

You may configure or override this in two ways:

1. Default for all users:  
    If defined, the first entry in [`.spec.idporten.postLogoutRedirectURIs`](../../../nais-application/application.md#idportenpostlogoutredirecturis)
    will be used.

2. Runtime per-user:  
    Set the `post_logout_redirect_uri` parameter when redirecting the user to logout:  
    ```
    https://app.ingress/oauth2/logout?post_logout_redirect_uri=https://example.nav.no
    ```

Note that ID-porten requires the exact redirect URI to be pre-registered. That is, the complete URI should be listed 
under [`.spec.idporten.postLogoutRedirectURIs`](../../../nais-application/application.md#idportenpostlogoutredirecturis). 
Otherwise, the user will not be redirected to the given URI.

### Error Handling

Authentication should generally not fail. However, in the event that it does happen; the sidecar automatically presents 
the end-users with a simple error page that allows the user to retry the authentication flow.

If you wish to customize or handle these errors yourselves, set the `.spec.idporten.sidecar.errorPath` to the absolute path
within your ingress that should handle such requests:

```yaml
spec:
  idporten:
    sidecar:
      errorPath: /login/error
```

The sidecar will now redirect any errors to this path, along with the following query parameters:

- `correlation_id` - UUID that uniquely identifies the request, for tracing and log correlation.
- `status_code` - HTTP status code which indicates the type of error that occurred.

## Responsibilities and Guarantees

The following describes the contract for usage of the sidecar.

### Sidecar

**The sidecar guarantees the following:**

* The `Authorization` header is added to the original request if the user has a valid session.
* The `Authorization` header is removed from the original request if the user _does not_ have a valid session.
* All HTTP requests to the `/oauth2` endpoints [defined above](#endpoints) are owned by the sidecar and will never be forwarded to the application.
* The sidecar is safe to enable and use with multiple replicas of your application.
* The sidecar stores session data to a highly available Redis service on Aiven, and falls back to using cookies if unavailable.

**The sidecar does _not_:**

* Automatically refresh the user's tokens. 
* Secure your application's endpoints.
* Validate the user's access token set in the `Authorization` header. The token may be invalid or expired by the time your application receives it.

### Your application

**Your application should secure its own endpoints.** That is, deny access to sensitive endpoints if the appropriate authentication is not supplied. 

#### Token Validation

Your application should also validate the claims and signature for the ID-porten JWT `access_token` attached by the sidecar. 
That is, validate the standard claims such as `iss`, `iat`, `exp`.

Note that the `aud` claim is _not_ set for ID-porten access tokens. 
You should instead validate that the `client_id` claim has a value equal to your [own ID-porten client ID](README.md#idporten_client_id).

Validate that the `acr` claim exists and that the set level matches the minimum [security level](#security-levels) for your endpoints:

* If your endpoint(s) accepts a minimum of `Level3` authentication, you must also accept `Level4`.
* The inverse should be rejected. That is, applications expecting `Level4` authentication should _NOT_ accept tokens with `acr=Level3`.

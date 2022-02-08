---
description: Reverse-proxy that handles automatic authentication and login/logout flows for Azure AD.
---

# Azure AD sidecar

!!! warning "Status: Beta"
    This feature is only available in the [GCP clusters](../../../clusters/gcp.md).

    **Experimental**: this is a new feature. Use it in production, but be aware that bugs might arise.

    Report any issues to the #nais channel on Slack.

## Description

A reverse proxy that automatically handles of Azure AD login, logout, and front-channel logout.

!!! info "Prerequisites"
    - [x] Ensure that you first [enable Azure AD for your application](README.md).
    - [x] Ensure that you also define at least one [ingress](../../../nais-application/application.md#ingresses) for your application.

All HTTP requests to the application will be intercepted by a sidecar (["_wonderwall_"](https://github.com/nais/wonderwall)).

If the user does _not_ have a valid local session with the sidecar, the request will be proxied as-is without 
modifications to the application container.

In order to obtain a local session, the user must be redirected to the `/oauth2/login` endpoint, which performs the
[OpenID Connect Authorization Code Flow as specified by Microsoft](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow).

If the user successfully completed the login flow, a session is established with the sidecar. All requests that are 
forwarded to the application container will now contain an `Authorization` header with the user's `access_token` from Azure AD.

```
Authorization: Bearer JWT_ACCESS_TOKEN
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
      azure:
        sidecar:
          enabled: true
          autoLogin: false
          errorPath: ""
    ```

See the [NAIS manifest](../../../nais-application/application.md#azuresidecar).

## Endpoints

The sidecar provides these endpoints under `https://app.ingress`:

* `/oauth2/login` redirects the user to Azure AD to perform the OpenID Connect Authorization Code Flow.
* `/oauth2/callback` handles callbacks from Azure AD as part of the OpenID Connect Authorization Code Flow.
* `/oauth2/logout` implements [self-initiated logout](https://openid.net/specs/openid-connect-rpinitiated-1_0.html).
* `/oauth2/logout/frontchannel` implements [front-channel logout](https://openid.net/specs/openid-connect-frontchannel-1_0.html).

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

#### Auto Login

If you want _all_ routes to your application to require an authenticated session, you can enable auto-login
by setting the `.spec.azure.sidecar.autoLogin` field to `true`.
This will make the sidecar automatically redirect
any user to login when attempting to browse to any path for your application. You should still validate and check the
`Authorization` header and the token within as specified in [responsibilitites and guarantees](#responsibilities-and-guarantees).

### Logout

When you must log a user out, redirect to the user to:

```
https://app.ingress/oauth2/logout
```

The user's session with the sidecar will be cleared, and the user will be redirected to Azure AD for global logout.

### Error Handling

Authentication should generally not fail. However, in the event that it does happen; the sidecar automatically presents 
the end-users with a simple error page that allows the user to retry the authentication flow.

If you wish to customize or handle these errors yourselves, set the `.spec.azure.sidecar.errorPath` to the absolute path
within your ingress that should handle such requests:

```yaml
spec:
  azure:
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

Your application should also validate the claims and signature for the Azure AD JWT `access_token` attached by the sidecar.

That is, validate the standard claims such as `iss`, `iat`, `exp`, and `aud`.

`aud` must be equal to [your application's client ID](usage.md#azure_app_client_id) in Azure AD.

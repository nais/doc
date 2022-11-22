# Wonderwall (sidecar for authentication)

[Wonderwall](https://github.com/nais/wonderwall) is an application that implements an OpenID Connect (OIDC)
[Relying Party (client)](../security/auth/concepts/actors.md#client) in a way that makes it easy to plug into Kubernetes
as a _sidecar_.

!!! abstract

    Wonderwall functions as a reverse proxy that intercepts and proxies requests to your application. It provides endpoints
    to perform logins and logouts for end users, along with session management - so that your application does not have to.

    All HTTP requests to the application will be intercepted by Wonderwall, which is attached to your application's pod as a
    sidecar.

    If the user does _not_ have a valid local session with the sidecar, the request will be proxied to the application
    container with the `Authorization` removed.

    In order to obtain a local session, the user must be redirected to the `/oauth2/login` endpoint, which performs the
    [OpenID Connect Authorization Code Flow](../security/auth/concepts/protocols.md#openid-connect).

    If the user successfully completed the login flow, the sidecar creates and stores a session. A corresponding session 
    cookie is created and set before finally redirecting user agent to the application. All requests that 
    are forwarded to the application container will now contain an `Authorization` header with the user's `access_token`:

    ```
    Authorization: Bearer <JWT_ACCESS_TOKEN>
    ```

    **Your application is [responsible](#3-token-validation) for validating the `access_token`.**

## Providers

The platform allows for integration with the following providers:

- [Azure AD](../security/auth/azure-ad/sidecar.md)
- [ID-porten](../security/auth/idporten/sidecar.md)

## Features

Wonderwall aims to be compliant with OAuth 2.1, and supports the following:

- [OpenID Connect Authorization Code Flow](../security/auth/concepts/protocols.md#openid-connect) with mandatory use of
  PKCE, state and nonce
- [Client authentication](../security/auth/concepts/actors.md#client-authentication)
  using [client assertions](../security/auth/concepts/actors.md#client-assertion) (`private_key_jwt`)
- [RP-initiated logout](https://openid.net/specs/openid-connect-rpinitiated-1_0.html)
- [Front-channel logout](https://openid.net/specs/openid-connect-frontchannel-1_0.html)

## Overview

The image below shows the overall architecture of an application when using Wonderwall as a sidecar:

???+ "Architecture"
    ![The architectural diagram shows the browser sending a request into the Kubernetes container, requesting the ingress https://<app>.nav.no, requesting the service https://<app>.<namespace>, sending it to the pod, which contains the sidecar. The sidecar sends a proxy request to the app, in addition to triggering and handling  the Open ID Connect Auth Code Flow to the identity provider. The identity provider is outside the Kubernetes container. ](../assets/wonderwall-architecture.png)

The sequence diagram below shows the default behavior of the sidecar:

???+ "Sequence Diagram"
    ![The sequence diagram shows the default behaviour of the sidecar, depending on whether the user already has a session or not. If the user does have a session, the sequence is as follows: 1. The user visits a path, that requests the ingress.  2. The request is forwarded to wonderwall 3. Wonderwall checks for a session in session storage. 4. Wonderwall attaches Authorization header and proxies request and sends it to the application. 5. The application returns a response to Wonderwall. 6. Wonderwall returns the response to the user. If the user does not have a session, the sequence is as follows: 1. The user visits a path, that requests the ingress.  2. The request is forwarded to wonderwall 3. Wonderwall checks for a session in session storage.  4. Wonderwall removes Authorization header and proxies request and sends it to the application. 5. The application returns a response to Wonderwall. 6. Wonderwall returns the response to the user.](../assets/wonderwall-sequence.png)

Generally speaking, the recommended approach when using the Wonderwall sidecar is to put it in front of 
your backend-for-frontend server that serves your frontend. Otherwise, you might run into issues with the cookie 
configuration and allowed redirects - these are both effectively restricted to only match the domain and path for your 
application's ingress.

## Endpoints

The sidecar provides these endpoints under your application's [ingress](../nais-application/application.md#ingresses):

| Path                           | Description                                                                | Note              |
|--------------------------------|----------------------------------------------------------------------------|-------------------|
| `GET /oauth2/login`            | Initiates the OpenID Connect Authorization Code flow                       |                   |
| `GET /oauth2/logout`           | Initiates local and global/single-logout                                   |                   |
| `GET /oauth2/session`          | Returns the current user's session metadata                                |                   |
| `POST /oauth2/session/refresh` | Refreshes the tokens and returns the session metadata for the current user | Only for Azure AD |

## Usage

### Overview

The contract for usage of the sidecar is fairly simple. 

For any endpoint that requires authentication:

1. Validate the `Authorization` header as specified in the [application guidelines](#3-token-validation).
2. If the `Authorization` header is missing, redirect the user to the [login endpoint](#1-initiate-login).
3. If the JWT `access_token` in the `Authorization` header is invalid or expired, redirect the user to
  the [login endpoint](#1-initiate-login).
4. If you need to log out a user, redirect the user to the [logout endpoint](#2-initiate-logout).

---

### 1. Initiate Login

When you must authenticate a user, redirect to the user to:

```
https://<ingress>/oauth2/login
```

The user will be sent to the [identity provider] for authentication and then back to the sidecar's callback endpoint.

#### 1.1. Redirect after Login

After the callback is handled and the user is successfully authenticated, the user will be redirected in this priority:

1. The URL or absolute path set in the query parameter `redirect` in the initial login request, e.g:
```
https://<ingress>/oauth2/login?redirect=/some/path
```
If you include query parameters, ensure that they are URL encoded. 
The host and scheme (if provided) are stripped from the redirect URL, which effectively only allows redirects to paths
within your own ingress.

2. The root context path for your application's ingress. E.g. `/` for `https://<app>.nav.no`, or `/path` for `https://nav.no/path`.

#### 1.2. Autologin

If enabled, the `autoLogin` option will configure Wonderwall to automatically redirect HTTP `GET` requests to the login 
endpoint if the user does not have a session. It will set the `redirect` parameter for logins to the URL for the 
original request so that the user is redirected back to their intended location after login.

You should still check the `Authorization` header for a token and validate the token within as specified
in [the application guidelines](#3-token-validation). This is especially important as auto-logins will **NOT** trigger
for HTTP requests that are not `GET` requests, such as `POST` or `PUT`.

To ensure smooth end-user experiences whenever their session expires, your application must thus actively validate and
properly handle such requests. For example, your application might respond with an HTTP 401 to allow frontends to
cache or store payloads before redirecting them to the login endpoint.

Example configuration:

=== "ID-porten"

    ```yaml hl_lines="4"
    spec:
      idporten:
        sidecar:
          autoLogin: true
    ```
=== "Azure AD"

    ```yaml hl_lines="4"
    spec:
      azure:
        sidecar:
          autoLogin: true
    ```

This will match for all paths for your application's ingresses, except the following:

- `/oauth2/*`
- [`spec.prometheus.path`](../nais-application/application.md#prometheuspath), if defined
- [`spec.liveness.path`](../nais-application/application.md#livenesspath), if defined
- [`spec.readiness.path`](../nais-application/application.md#readinesspath), if defined

You can also define additional paths or patterns to be excluded: 

=== "ID-porten"

    ```yaml hl_lines="5-8"
    spec:
      idporten:
        sidecar:
          autoLogin: true
          autoLoginIgnorePaths:
            - /internal/*
            - /some/public/path
            - /static/stylesheet.css
    ```

=== "Azure AD"

    ```yaml hl_lines="5-8"
    spec:
      azure:
        sidecar:
          autoLogin: true
          autoLoginIgnorePaths:
            - /internal/*
            - /some/public/path
            - /static/stylesheet.css
    ```

These use glob-style matching, though only single asterisks are allowed.

???+ example "Example patterns"

    - `/allowed`
        - ✅ matches `/allowed` and `/allowed/`
        - ❌ does not match `/allowed/nope` or `/allowed/nope/`
    - `/public/*`
        - ✅ matches `/public/a` and `/public/a/`
        - ❌ does not match `/public`, `/public/` or `/public/a/b`
    - `/any*`
        - ✅ matches `/any`, `/any/`, `/anything`, `/anything/`, `/anywho` and `/anywho/`
        - ❌ does not match `/any/thing`, `/any/thing/` or `/anywho/mst/ve`
    - `/a/*/*`
        - ✅ matches `/a/b/c`, `/a/b/c/`, `/a/bee/cee` or `/a/bee/cee/`
        - ❌ does not match `/a`, `/a/`, `/a/b`, `/a/b/`, `/a/b/c/d`, or `/a/b/c/d/`
    - `/trailing/`
        - Trailing slashes in patterns are effectively dropped during matching.
        - ✅ matches `/trailing` and `/trailing/`
        - ❌ does not match `/trailing/nope` or `/trailing/nope/`

---

### 2. Initiate Logout

When you must log a user out, redirect to the user to:

```
https://<ingress>/oauth2/logout
```

The user's session with the sidecar will be cleared, and the user will be redirected to the identity provider for global
logout.

---

### 3. Token Validation

!!! danger
    **Your application should secure its own endpoints.** That is, deny access to sensitive endpoints if the appropriate
    authentication is not supplied.

Your application should also [validate the claims and signature](../security/auth/concepts/tokens.md#token-validation)
for the JWT `access_token` attached by the sidecar.

Each provider may have some differences in claims and values; see their specific page for details:

- [Azure AD](../security/auth/azure-ad/sidecar.md#token-validation)
- [ID-porten](../security/auth/idporten/sidecar.md#token-validation)

---

### 4. Error Handling

Authentication should generally not fail. However, in the event that it does happen; the sidecar automatically presents
the end-users with a simple error page that allows the user to retry the authentication flow.

If you wish to customize or handle these errors yourselves, set the `errorPath` property to the absolute path within
your ingress that should handle such requests. For example:

=== "ID-porten"
    ```yaml hl_lines="4"
    spec:
      idporten:
        sidecar:
          errorPath: /login/error
    ```
=== "Azure AD"
    ```yaml hl_lines="4"
    spec:
      azure:
        sidecar:
          errorPath: /login/error
    ```

The sidecar will now redirect any errors to this path (i.e. `https://<ingress>/<errorPath>`), along with the following
query parameters:

- `correlation_id` - UUID that uniquely identifies the request, for tracing and log correlation.
- `status_code` - HTTP status code which indicates the type of error that occurred.

---

### 5. Resource Requirements

The sidecar container is set up with some default [resource requirements](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/). 
This can be customized to your needs. Defaults shown below:

=== "ID-porten"
    ```yaml hl_lines="4-10"
    spec:
      idporten:
        sidecar:
          resources:
            limits:
              cpu: 250m
              memory: 256Mi
            requests:
              cpu: 20m
              memory: 32Mi
    ```
=== "Azure AD"
    ```yaml hl_lines="4-10"
    spec:
      azure:
        sidecar:
          resources:
            limits:
              cpu: 250m
              memory: 256Mi
            requests:
              cpu: 20m
              memory: 32Mi
    ```

### 6. Sessions

Sessions are stored server-side; we only store a session identifier at the end-user's user agent.

The session lifetime depends on the identity provider:

| Identity Provider | Session Lifetime |
|-------------------|------------------|
| Azure AD          | 10 hours         |
| ID-porten         | 1 hour           |

After the session has expired, the user must be redirected to the `/oauth2/login` endpoint again.

For convenience, we also offer an endpoint that returns metadata about the user's session as a JSON object at `GET /oauth2/session`. 
This endpoint will respond with HTTP status codes on errors:

- `HTTP 401 Unauthorized` - no session cookie or matching session found (e.g. user is not authenticated, or has logged out)
- `HTTP 500 Internal Server Error` - the session store is unavailable, or Wonderwall wasn't able to process the request

Otherwise, an `HTTP 200 OK` is returned with the metadata with the `application/json` as the `Content-Type`.

???+ example

    Request:

    ```
    GET /oauth2/session
    ```
    
    Response:
    
    ```
    HTTP/2 200 OK
    Content-Type: application/json
    ```

    ```json
    {
      "session": {
        "created_at": "2022-08-31T06:58:38.724717899Z", 
        "ends_at": "2022-08-31T16:58:38.724717899Z",
        "ends_in_seconds": 14658
      },
      "tokens": {
        "expire_at": "2022-08-31T14:03:47.318251953Z",
        "refreshed_at": "2022-08-31T12:53:58.318251953Z",
        "expire_in_seconds": 4166
      }
    }
    ```

Most of these fields should be self-explanatory, but we'll be explicit with their description:

| Field                      | Description                                                                       |
|----------------------------|-----------------------------------------------------------------------------------|
| `session.created_at`       | The timestamp that denotes when the session was first created.                    |
| `session.ends_at`          | The timestamp that denotes when the session will end.                             |
| `session.ends_in_seconds`  | The number of seconds until the session ends.                                     |
| `tokens.expire_at`         | The timestamp that denotes when the tokens within the session will expire.        |
| `tokens.refreshed_at`      | The timestamp that denotes when the tokens within the session was last refreshed. |
| `tokens.expire_in_seconds` | The number of seconds until the tokens expire.                                    |

#### 6.1. Refresh Tokens

!!! info "Limited Availability"
    This feature is currently only available for [Azure AD](../security/auth/azure-ad/sidecar.md)

Tokens within the session will usually expire before the session itself. To avoid redirecting end-users to the 
`/oauth2/login` endpoint whenever the access tokens have expired, we can use refresh tokens to silently get new tokens.

This is **enabled by default** for applications using Wonderwall with Azure AD. 

Tokens will at the _earliest_ be automatically renewed 5 minutes before they expire. If the token already _has_ expired,
but the session is still exists and is active, a refresh attempt is automatically triggered. This
happens whenever the end-user visits any path that belongs to the application.

If you want to manually trigger token refreshes, you can make use of a new endpoint:

- `POST /oauth2/session/refresh` - manually refreshes the tokens for the user's session, and returns the metadata like in
  `/oauth2/session` described previously

???+ example

    Request:
    
    ```
    POST /oauth2/session/refresh
    ```
    
    Response:
    
    ```
    HTTP/2 200 OK
    Content-Type: application/json
    ```

    ```json
    {
      "session": {
        "created_at": "2022-08-31T06:58:38.724717899Z", 
        "ends_at": "2022-08-31T16:58:38.724717899Z",
        "ends_in_seconds": 14658
      },
      "tokens": {
        "expire_at": "2022-08-31T14:03:47.318251953Z",
        "refreshed_at": "2022-08-31T12:53:58.318251953Z",
        "expire_in_seconds": 4166,
        "next_auto_refresh_in_seconds": 3866,
        "refresh_cooldown": true,
        "refresh_cooldown_seconds": 37
      }
    }
    ```

Additionally, the metadata object returned by both the `/oauth2/session` and `/oauth2/session/refresh` endpoints now
contain some new fields in addition to the previous fields:

| Field                                 | Description                                                                                     |
|---------------------------------------|-------------------------------------------------------------------------------------------------|
| `tokens.next_auto_refresh_in_seconds` | The number of seconds until the earliest time where the tokens will automatically be refreshed. |
| `tokens.refresh_cooldown`             | A boolean indicating whether or not the refresh operation is on cooldown or not.                |
| `tokens.refresh_cooldown_seconds`     | The number of seconds until the refresh operation is no longer on cooldown.                     |

Note that the refresh operation has a default cooldown period of 1 minute, which may be shorter depending on the token lifetime
of the tokens returned by the identity provider. In other words, a refresh is only triggered if `tokens.refresh_cooldown` is `false`.

## Responsibilities & Guarantees

**The sidecar:**

* Adds the `Authorization` header with the user's JWT access token to the original request if the user has a valid
  session.
* Removes the `Authorization` header from the original request if the user _does not_ have a valid session.
* Owns the `/oauth2` endpoints [defined above](#endpoints) and intercepts all HTTP requests to these. They will never be
  forwarded to your application.
* Is safe to enable and use with multiple replicas of your application.
* Stores session data to a highly available Redis service on Aiven.
* Validates the `id_token` acquired from this flow in accordance with the
  [OpenID Connect specifications](https://openid.net/specs/openid-connect-core-1_0.html#IDTokenValidation).

**The sidecar does _not_:**

* Secure your application's endpoints in any way.
* Validate the user's `access_token` set in the `Authorization` header. The token may be invalid or expired by the time
  your application receives it.

[identity provider]: ../security/auth/concepts/actors.md#identity-provider

## Development

Wonderwall can be fired up locally if you so desire.
See the [README on GitHub](https://github.com/nais/wonderwall#docker-compose) for an example setup with Docker Compose.

---
tags: [auth, reference]
---

# Auth reference

## Libraries for mocking

- <https://github.com/navikt/mock-oauth2-server>
- <https://github.com/navikt/fakedings> - a wrapper around the above mock server

## Libraries and frameworks for validating and acquiring tokens

Below is a list of some well-known and widely used libraries for handling OAuth, OpenID Connect, and token validation.

### JVM

- <https://github.com/navikt/token-support>
- <https://ktor.io/docs/jwt.html>
- <https://spring.io/projects/spring-security-oauth>
- <https://github.com/pac4j/pac4j>
- <https://connect2id.com/products/nimbus-oauth-openid-connect-sdk>

### JavaScript

- <https://github.com/navikt/oasis>
- <https://github.com/panva/jose>
- <https://github.com/panva/node-openid-client>

See also <https://jwt.io/libraries> for a non-comprehensive list for many other various languages.

## Token generators

In some cases, you want to locally develop and test against a secured API in the development environments.
You will need a token to access said API.

See the respective identity provider pages for details on acquiring such tokens:

- [Entra ID](../entra-id/how-to/generate.md)
- [TokenX](../tokenx/how-to/generate.md)

## Login proxy

Reference documentation for the [login proxy](../explanations/README.md#login-proxy) provided by NAIS.
Supported identity providers:

- Entra ID for [logging in employees](../entra-id/how-to/login.md).
- ID-porten for [logging in citizens](../idporten/how-to/login.md).

<<gcp_only("Login proxy")>>

### Autologin

[Autologin](../explanations/README.md#autologin) is not enabled by default. To enable autologin:

=== "ID-porten"

    ```yaml hl_lines="4"
    spec:
      idporten:
        sidecar:
          autoLogin: true
    ```
=== "Entra ID"

    ```yaml hl_lines="4"
    spec:
      azure:
        sidecar:
          autoLogin: true
    ```

#### Autologin response

[Top-level navigation requests](../explanations/README.md?h=top+level+navigation#autologin) result in a `HTTP 302 Found` response with the `Location` header pointing to the [login endpoint](../reference/README.md#login-endpoint):

- The `redirect` parameter is set to the original request's `Referer` header to preserve the user's original location.
- If the `Referer` header is empty, we use the matching ingress context path for the original request.

```http title="Navigational request"
GET /some/path

Sec-Fetch-Dest: document
Sec-Fetch-Mode: navigate
Referer: https://<ingress>/original/path
```

```http title="Response"
HTTP/2 302 Found
Location: https://<ingress>/oauth2/login?redirect=/original/path
```

All other requests are considered non-navigational, such as:

- `POST` or `PUT` requests
- `fetch`, `XMLHttpRequest`/`XHR` / `AJAX` requests from browsers

These requests result in a `HTTP 401 Unauthorized` response with the `Location` header set as described previously:

```http title="Non-Navigational request"
GET /some/path

Sec-Fetch-Dest: empty
Sec-Fetch-Mode: cors
Referer: https://<ingress>/original/path
```

```http title="Response"
HTTP/2 401 Unauthorized
Location: https://<ingress>/oauth2/login?redirect=/original/path
```

#### Autologin exclusions

Autologin will by default match all paths for your application's ingresses, except the following:

- `/oauth2/**`
- [`spec.prometheus.path`](../../workloads/application/reference/application-spec.md#prometheuspath) (if defined)
- [`spec.liveness.path`](../../workloads/application/reference/application-spec.md#livenesspath) (if defined)
- [`spec.readiness.path`](../../workloads/application/reference/application-spec.md#readinesspath) (if defined)

You can define additional paths or patterns to be excluded:

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

=== "Entra ID"

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

The paths must be absolute paths. The match patterns use glob-style matching.

??? example "Example match patterns (click to expand)"

    - `/allowed` or `/allowed/`
        - Trailing slashes in paths and patterns are effectively ignored during matching.
        - ✅ matches:
            - `/allowed`
            - `/allowed/`
        - ❌ does not match:
            - `/allowed/nope`
            - `/allowed/nope/`
    - `/public/*`
        - A single asterisk after a path means any subpath _directly_ below the path, excluding itself and any nested paths.
        - ✅ matches:
            - `/public/a`
        - ❌ does not match:
            - `/public`
            - `/public/a/b`
    - `/public/**`
        - Double asterisks means any subpath below the path, including itself and any nested paths.
        - ✅ matches:
            - `/public`
            - `/public/a`
            - `/public/a/b`
        - ❌ does not match:
            - `/not/public`
            - `/not/public/a`
    - `/any*`
        - ✅ matches:
            - `/any`
            - `/anything`
            - `/anywho`
        - ❌ does not match:
            - `/any/thing`
            - `/anywho/mst/ve`
    - `/a/*/*`
        - ✅ matches:
            - `/a/b/c`
            - `/a/bee/cee`
        - ❌ does not match:
            - `/a`
            - `/a/b`
            - `/a/b/c/d`
    - `/static/**/*.js`
        - ✅ matches:
            - `/static/bundle.js`
            - `/static/min/bundle.js`
            - `/static/vendor/min/bundle.js`
        - ❌ does not match:
            - `/static`
            - `/static/some.css`
            - `/static/min`
            - `/static/min/some.css`
            - `/static/vendor/min/some.css`

### Endpoints

| Path                                    | Description                                                                                                   | Details                                               |
|-----------------------------------------|---------------------------------------------------------------------------------------------------------------|-------------------------------------------------------|
| `GET <ingress>/oauth2/login`            | Redirect the user agent here to initiate login.                                                               | [Login endpoint](#login-endpoint)                     |
| `GET <ingress>/oauth2/logout`           | Redirect the user agent here to initiate logout.                                                              | [Logout endpoint](#logout-endpoint)                   |
| `GET <ingress>/oauth2/session`          | Must be requested from user agent. Returns the current user's session metadata                                | [Session endpoint](#session-endpoint)                 |
| `POST <ingress>/oauth2/session/refresh` | Must be requested from user agent. Refreshes the tokens and returns the session metadata for the current user | [Session refresh endpoint](#session-refresh-endpoint) |

#### Login endpoint

This endpoint initiates the authentication flow. It is available at:

```http
https://<ingress>/oauth2/login
```

To log in an end-user, redirect them to this endpoint.
After login, they are by default redirected back to the matching context path for your application's ingress:

- `/` for `https://<app>.nav.no`
- `/path` for `https://nav.no/path`

Supported query parameters:

`redirect`

:   Overrides the default redirect:

    ```
    https://<ingress>/oauth2/login?redirect=/some/path
    ```

    Value must be an URL encoded absolute path.

`prompt`

:   Prompts the user to select an account at the identity provider.
    Useful for switching between multiple accounts.

    ```
    https://<ingress>/oauth2/login?prompt=select_account
    ```

    Value must be `select_account`.

#### Logout endpoint

This endpoint triggers single-logout. It is available at:

```http
https://<ingress>/oauth2/logout
```

To log out an end-user, redirect them to this endpoint.
After logout, they are by default redirected back to a preconfigured URL.

Supported query parameters:

`redirect`

:   Overrides the default redirect:

    ```
    https://<ingress>/oauth2/logout?redirect=/some/path
    ```

    Value must be an URL encoded absolute path.

#### Session endpoint

This endpoint returns metadata about the end-user's [session](../explanations/README.md#sessions) as a JSON object.
Requests to this endpoint must be triggered from the user agent.

```http title="Request"
GET /oauth2/session
```

```http title="Response"
HTTP/2 200 OK
Content-Type: application/json

{
  "session": {
    "active": true,
    "created_at": "2022-08-31T06:58:38.724717899Z", 
    "ends_at": "2022-08-31T16:58:38.724717899Z",
    "ends_in_seconds": 14658,
    "timeout_at": "0001-01-01T00:00:00Z",
    "timeout_in_seconds": -1
  },
  "tokens": {
    "expire_at": "2022-08-31T14:03:47.318251953Z",
    "expire_in_seconds": 4166
    "next_auto_refresh_in_seconds": -1,
    "refreshed_at": "2022-08-31T12:53:58.318251953Z",
    "refresh_cooldown": false,
    "refresh_cooldown_seconds": 0
  }
}
```

The table below describes the different fields in the JSON response.

??? note "Session Metadata Field Descriptions (click to expand)"

    | Field                                 | Description                                                                                                                                                      |
    |---------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
    | `session.active`                      | Whether or not the session is active. If `false`, the session cannot be refreshed and the user must be redirected to login to obtain a new session.              |
    | `session.created_at`                  | The timestamp that denotes when the session was first created.                                                                                                   |
    | `session.ends_at`                     | The timestamp that denotes when the session will end. After this point, the session is expired and the user must be redirected to login to obtain a new session. |
    | `session.ends_in_seconds`             | The number of seconds until `session.ends_at`.                                                                                                                   |
    | `session.timeout_at`                  | The timestamp that denotes when the session will time out. The zero-value, `0001-01-01T00:00:00Z`, means no timeout.                                             |
    | `session.timeout_in_seconds`          | The number of seconds until `session.timeout_at`. A value of `-1` means no timeout.                                                                              |
    | `tokens.expire_at`                    | The timestamp that denotes when the tokens within the session will expire.                                                                                       |
    | `tokens.expire_in_seconds`            | The number of seconds until `tokens.expire_at`.                                                                                                                  |
    | `tokens.next_auto_refresh_in_seconds` | The number of seconds until the earliest time where the tokens will automatically be refreshed. A value of -1 means that automatic refreshing is not enabled.    |
    | `tokens.refreshed_at`                 | The timestamp that denotes when the tokens within the session was last refreshed.                                                                                |
    | `tokens.refresh_cooldown`             | A boolean indicating whether or not the refresh operation is on cooldown or not.                                                                                 |
    | `tokens.refresh_cooldown_seconds`     | The number of seconds until the refresh operation is no longer on cooldown.                                                                                      |

This endpoint will respond with the following HTTP status codes on errors:

- `HTTP 401 Unauthorized` - no session cookie or matching session found, or maximum lifetime reached
- `HTTP 500 Internal Server Error` - the login proxy wasn't able to process the request

Otherwise, an `HTTP 200 OK` is returned with the metadata with the `application/json` as the `Content-Type`.

Note that this endpoint will still return `HTTP 200 OK` for _inactive_ sessions, as long as the session is not _expired_.
This allows application to display errors before redirecting the user to login on timeouts.

This also means that you should not use the HTTP response status codes alone as an indication of whether the user is authenticated or not.

#### Session refresh endpoint

This endpoint allows for refreshing the end-user's session on demand.
Requests to this endpoint must be triggered from the user agent.

Using this endpoint is only necessary when [session inactivity timeouts](#session-inactivity-timeout) are enabled.
The end-user should be prompted to extend their session in accordance with [WCAG 2.2.1](https://www.w3.org/WAI/WCAG21/Understanding/timing-adjustable).

The endpoint will respond with a `HTTP 401 Unauthorized` if the session is _inactive_.
It is otherwise equivalent to the [session endpoint](#session-endpoint).

```http title="Request"
POST /oauth2/session/refresh
```

```http title="Response"
HTTP/2 200 OK
Content-Type: application/json

{
  "session": {
    "active": true,
    "created_at": "2022-08-31T06:58:38.724717899Z", 
    "ends_at": "2022-08-31T16:58:38.724717899Z",
    "ends_in_seconds": 14658,
    "timeout_at": "0001-01-01T00:00:00Z",
    "timeout_in_seconds": -1
  },
  "tokens": {
    "expire_at": "2022-08-31T14:03:47.318251953Z",
    "expire_in_seconds": 4166,
    "next_auto_refresh_in_seconds": 3866,
    "refreshed_at": "2022-08-31T12:53:58.318251953Z",
    "refresh_cooldown": true,
    "refresh_cooldown_seconds": 37
  }
}
```

### Session management

A user's [session](../explanations/README.md#sessions) can be inspected by requesting the [session endpoint](#session-endpoint) from their user agent.

#### Session lifetime

Sessions have a maximum lifetime, after which the user is unauthenticated and must [perform a new login](#login-endpoint).

| Identity provider | Maximum lifetime |
|-------------------|------------------|
| ID-porten         | 6 hours          |
| Entra ID          | 10 hours         |

#### Session inactivity timeout

Sessions may have an _inactivity timeout_.
If enabled, the session is marked as invalid if the timeout has been reached.
The timeout is reset each time the user's session is refreshed through the [session refresh endpoint](#session-refresh-endpoint).

| Identity provider | Inactivity timeout |
|-------------------|--------------------|
| ID-porten         | ✅ Yes, 1 hour      |
| Entra ID          | ❌ No timeout       |

If inactivity timeout is not enabled, the tokens within the session are automatically refreshed until the session reaches its maximum lifetime.

{%- if tenant() == "nav" %}
!!! info "Automatic session management for ID-porten"

    [nav-dekoratoren](https://github.com/navikt/nav-dekoratoren#utloggingsvarsel) displays warnings for sessions nearing lifetime expiry or inactivity timeout,
    and supports user-initiated session refresh operations.

    You do not need to implement your own session management logic if you use `nav-dekoratoren`.

{%- endif %}

The durations for maximum lifetime and inactivity timeout are subject to change.
Do not hard-code or depend on these exact values in your application.
Prefer using the metadata returned by the [session endpoint](#session-endpoint) to determine the session's state.

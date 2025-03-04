---
tags: [auth, reference]
---

# Auth reference

{%- if tenant() == "nav" %}

## Libraries for mocking

- <https://github.com/navikt/mock-oauth2-server>
- <https://github.com/navikt/fakedings> - a wrapper around the above mock server

## Libraries and frameworks for validating and acquiring tokens

Below is a list of some well-known and widely used libraries for handling OAuth, OpenID Connect, and token validation.

### JVM

- <https://github.com/navikt/token-support>
- <https://ktor.io/docs/jwt.html>
- <https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/>
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

Reference documentation for the [login proxy](../explanations/README.md#login-proxy) provided by Nais.
Supported identity providers:

- Entra ID for [logging in employees](../entra-id/how-to/login.md).
- ID-porten for [logging in citizens](../idporten/how-to/login.md).
- [Generic OpenID Connect providers](../how-to/login.md) are also supported as an advanced use case.

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

Responses returned by autologin depends on the type of request.

_Top-level navigation requests_ result in a `HTTP 302 Found` response.

??? info "What is a top-level navigation request?"

    A _top-level navigation request_ is a `GET` request that fulfills at least one of the following properties:

    1. Has the [Fetch metadata request headers](https://developer.mozilla.org/en-US/docs/Glossary/Fetch_metadata_request_header) `Sec-Fetch-Dest=document` and `Sec-Fetch-Mode=navigate`, or
    2. Has an `Accept` header that includes `text/html`

```http title="Top-level navigation request"
GET /some/path

Sec-Fetch-Dest: document
Sec-Fetch-Mode: navigate
Referer: https://<ingress>/original/path
```

```http title="Response"
HTTP/2 302 Found
Location: https://<ingress>/oauth2/login?redirect=/original/path
```

This automatically redirects the user to the [login endpoint](../reference/README.md#login-endpoint).
To preserve the user's original location, the `redirect` parameter is set to the request's `Referer` header.
If the `Referer` header is empty, the matching ingress context path is used.

_Non-navigation requests_ result in an equivalent response, but with the `HTTP 401 Unauthorized` status code:

??? info "What is a non-navigation request?"

    _Non-navigation requests_ are any requests that aren't considered top-level navigation requests.
    Examples include:

    - Non-`GET` requests, such as `POST` or `PUT` requests
    - Any browser request that uses the `Fetch` or `XMLHttpRequest` APIs

```http title="Non-navigation request"
GET /some/path

Sec-Fetch-Dest: empty
Sec-Fetch-Mode: cors
Referer: https://<ingress>/original/path
```

```http title="Response"
HTTP/2 401 Unauthorized
Content-Type: application/json

{"error": "unauthenticated, please log in"}
```

Ensure that your frontend code handles `HTTP 401` responses and appropriately notifies the user and/or redirects them to the [login endpoint](#login-endpoint).

#### Autologin exclusions

Autologin matches all paths for your application's ingresses, except the following:

- `/oauth2/**`
- [`spec.prometheus.path`](../../workloads/application/reference/application-spec.md#prometheuspath) (if defined)
- [`spec.liveness.path`](../../workloads/application/reference/application-spec.md#livenesspath) (if defined)
- [`spec.readiness.path`](../../workloads/application/reference/application-spec.md#readinesspath) (if defined)

You can exclude additional paths by exact match or wildcard patterns:

=== "ID-porten"

    ```yaml hl_lines="5-9"
    spec:
      idporten:
        sidecar:
          autoLogin: true
          autoLoginIgnorePaths:
            - /exact/path
            - /api/v1/*
            - /api/**
    ```

=== "Entra ID"

    ```yaml hl_lines="5-9"
    spec:
      azure:
        sidecar:
          autoLogin: true
          autoLoginIgnorePaths:
            - /exact/path
            - /api/v1/*
            - /api/**
    ```

The paths must be absolute paths. The match patterns use glob-style matching:

- Trailing slashes in paths and patterns are ignored.
- A single asterisk (`/*`) is non-recursive. This matches any subpath _directly_ below the path, excluding itself and any nested paths.
- Double asterisks (`/**`) is recursive. This matches any subpath below the path, including itself and any nested paths.

??? example "Example match patterns (click to expand)"

    `/allowed` or `/allowed/`

    :   Trailing slashes in paths and patterns are effectively ignored during matching.

        ✅ matches:

        - `/allowed`
        - `/allowed/`

        ❌ does not match:

        - `/allowed/nope`
        - `/allowed/nope/`

    `/public/*`

    :   A single asterisk after a slash means any subpath _directly_ below the path, excluding itself and any nested paths.

        ✅ matches:

        - `/public/a`

        ❌ does not match:

        - `/public`
        - `/public/a/b`

    `/public/**`

    :   Double asterisks after a slash means any subpath below the path, including itself and any nested paths.

        ✅ matches:

        - `/public`
        - `/public/a`
        - `/public/a/b`

        ❌ does not match:

        - `/not/public`
        - `/not/public/a`

    `/any*`

    :   A single asterisk matches any sequence of characters within a path segment.

        ✅ matches:

        - `/any`
        - `/anything`
        - `/anywho`

        ❌ does not match:

        - `/any/thing`
        - `/anywho/mst/ve`

    `/a/*/*`

    :   ✅ matches:

        - `/a/b/c`
        - `/a/bee/cee`

        ❌ does not match:

        - `/a`
        - `/a/b`
        - `/a/b/c/d`

    `/static/**/*.js`

    :   ✅ matches:

        - `/static/bundle.js`
        - `/static/min/bundle.js`
        - `/static/vendor/min/bundle.js`

        ❌ does not match:

        - `/static`
        - `/static/some.css`
        - `/static/min`
        - `/static/min/some.css`
        - `/static/vendor/min/some.css`

### Endpoints

The following endpoints are available under your application's [ingress](../../workloads/application/explanations/expose.md#ingress):

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
The HTTP status code alone is insufficient to determine the session state.

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

!!! info "Automatic session management for ID-porten"

    [nav-dekoratoren](https://github.com/navikt/nav-dekoratoren#utloggingsvarsel) displays warnings for sessions nearing lifetime expiry or inactivity timeout,
    and supports user-initiated session refresh operations.

    You do not need to implement your own session management logic if you use `nav-dekoratoren`.

The durations for maximum lifetime and inactivity timeout are subject to change.
Do not hard-code or depend on these exact values in your application.
Prefer using the metadata returned by the [session endpoint](#session-endpoint) to determine the session's state.

## Texas

Reference documentation for [Token Exchange as a Service (Texas)](../explanations/README.md#texas).

### Environment Variables

The following environment variables are available for your application to interact with Texas:

| Variable                            | Description                                                                                                             |
|-------------------------------------|-------------------------------------------------------------------------------------------------------------------------|
| `NAIS_TOKEN_ENDPOINT`               | URL to token endpoint. Use this when you need a token for machine-to-machine interactions without end-user involvement. |
| `NAIS_TOKEN_EXCHANGE_ENDPOINT`      | URL to token exchange endpoint. Use this when you need to call another API on behalf of a logged-in end-user.           |
| `NAIS_TOKEN_INTROSPECTION_ENDPOINT` | URL to token introspection endpoint. Use this to validate a token and receive its claims in the response.               |

### OpenAPI specification

<swagger-ui src="https://raw.githubusercontent.com/nais/texas/refs/heads/master/doc/openapi-spec.json"/>

{%- else %}

## Login proxy

Reference documentation for the [login proxy](../explanations/README.md#login-proxy) provided by Nais.

### Enforce login

[Enforcement of authenticated sessions](../explanations/README.md#enforce-login) is not enabled by default.
To enable enforcement of login, specify the following in your application's manifest:

```yaml hl_lines="4"
spec:
  login:
    enforce:
      enabled: true
```

#### Enforce mode response

Responses generated by the enforce mode depends on the type of request.

_Top-level navigation requests_ result in a `HTTP 302 Found` response.

??? info "What is a top-level navigation request?"

    A _top-level navigation request_ is a `GET` request that fulfills at least one of the following properties:

    1. Has the [Fetch metadata request headers](https://developer.mozilla.org/en-US/docs/Glossary/Fetch_metadata_request_header) `Sec-Fetch-Dest=document` and `Sec-Fetch-Mode=navigate`, or
    2. Has an `Accept` header that includes `text/html`

```http title="Top-level navigation request"
GET /some/path

Sec-Fetch-Dest: document
Sec-Fetch-Mode: navigate
Referer: https://<ingress>/original/path
```

```http title="Response"
HTTP/2 302 Found
Location: https://<ingress>/oauth2/login?redirect=/original/path
```

This automatically redirects the user to the [login endpoint](#login-endpoint).
To preserve the user's original location, the `redirect` parameter is set to the request's `Referer` header.
If the `Referer` header is empty, the matching ingress context path is used.

_Non-navigation requests_ result in an equivalent response, but with the `HTTP 401 Unauthorized` status code:

??? info "What is a non-navigation request?"

    _Non-navigation requests_ are any requests that aren't considered top-level navigation requests.
    Examples include:

    - Non-`GET` requests, such as `POST` or `PUT` requests
    - Any browser request that uses the `Fetch` or `XMLHttpRequest` APIs

```http title="Non-navigation request"
GET /some/path

Sec-Fetch-Dest: empty
Sec-Fetch-Mode: cors
Referer: https://<ingress>/original/path
```

```http title="Response"
HTTP/2 401 Unauthorized
Content-Type: application/json

{"error": "unauthenticated, please log in"}
```

Ensure that your frontend code handles `HTTP 401` responses and appropriately notifies the user and/or redirects them to the [login endpoint](#login-endpoint).

#### Enforce mode exclusions

Enforce mode matches all paths for your application's ingresses, except the following:

- `/oauth2/**`
- [`spec.prometheus.path`](../../workloads/application/reference/application-spec.md#prometheuspath) (if defined)
- [`spec.liveness.path`](../../workloads/application/reference/application-spec.md#livenesspath) (if defined)
- [`spec.readiness.path`](../../workloads/application/reference/application-spec.md#readinesspath) (if defined)

You can exclude additional paths by exact match or wildcard patterns:

```yaml hl_lines="5-9"
spec:
  login:
    enforce:
      enabled: true
      excludePaths:
        - /exact/path
        - /api/v1/*
        - /api/**
```

The paths must be absolute paths. The match patterns use glob-style matching:

- Trailing slashes in paths and patterns are ignored.
- A single asterisk (`/*`) is non-recursive. This matches any subpath _directly_ below the path, excluding itself and any nested paths.
- Double asterisks (`/**`) is recursive. This matches any subpath below the path, including itself and any nested paths.

??? example "Example match patterns (click to expand)"

    `/allowed` or `/allowed/`

    :   Trailing slashes in paths and patterns are effectively ignored during matching.

        ✅ matches:

        - `/allowed`
        - `/allowed/`

        ❌ does not match:

        - `/allowed/nope`
        - `/allowed/nope/`

    `/public/*`

    :   A single asterisk after a slash means any subpath _directly_ below the path, excluding itself and any nested paths.

        ✅ matches:

        - `/public/a`

        ❌ does not match:

        - `/public`
        - `/public/a/b`

    `/public/**`

    :   Double asterisks after a slash means any subpath below the path, including itself and any nested paths.

        ✅ matches:

        - `/public`
        - `/public/a`
        - `/public/a/b`

        ❌ does not match:

        - `/not/public`
        - `/not/public/a`

    `/any*`

    :   A single asterisk matches any sequence of characters within a path segment.

        ✅ matches:

        - `/any`
        - `/anything`
        - `/anywho`

        ❌ does not match:

        - `/any/thing`
        - `/anywho/mst/ve`

    `/a/*/*`

    :   ✅ matches:

        - `/a/b/c`
        - `/a/bee/cee`

        ❌ does not match:

        - `/a`
        - `/a/b`
        - `/a/b/c/d`

    `/static/**/*.js`

    :   ✅ matches:

        - `/static/bundle.js`
        - `/static/min/bundle.js`
        - `/static/vendor/min/bundle.js`

        ❌ does not match:

        - `/static`
        - `/static/some.css`
        - `/static/min`
        - `/static/min/some.css`
        - `/static/vendor/min/some.css`

### Endpoints

The following endpoints are available under your application's [ingress](../../workloads/application/explanations/expose.md#ingress):

| Path                                    | Description                                                                                                   | Details                                               |
|-----------------------------------------|---------------------------------------------------------------------------------------------------------------|-------------------------------------------------------|
| `GET <ingress>/oauth2/login`            | Redirect the user agent here to initiate login.                                                               | [Login endpoint](#login-endpoint)                     |
| `GET <ingress>/oauth2/logout`           | Redirect the user agent here to initiate logout.                                                              | [Logout endpoint](#logout-endpoint)                   |
| `GET <ingress>/oauth2/session`          | Must be requested from user agent. Returns the current user's session metadata                                | [Session endpoint](#session-endpoint)                 |

#### Login endpoint

This endpoint initiates the authentication flow. It is available at:

```http
https://<ingress>/oauth2/login
```

To log in an end-user, redirect them to this endpoint.
After login, they are by default redirected back to the matching context path for your application's ingress:

- `/` for `https://<app>.<<tenant()>>.example`
- `/path` for `https://<<tenant()>>.example/path`

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


`level`

:   The `acr_values` parameter for the OpenID Connect authentication request.

    ```
    https://<ingress>/oauth2/login?level=some_acr_value
    ```

    Value must be declared as supported by the Identity Provider through the `acr_values_supported` property in the metadata document.

`locale`

:   The `ui_locales` parameter for the OpenID Connect authentication request.

    ```
    https://<ingress>/oauth2/login?locale=en
    ```

    Value must be declared as supported by the Identity Provider through the `ui_locales_supported` property in the metadata document.

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

### Session management

A user's [session](../explanations/README.md#sessions) can be inspected by requesting the [session endpoint](#session-endpoint) from their user agent.

#### Session lifetime

Sessions have a maximum lifetime, after which the user is unauthenticated and must [perform a new login](#login-endpoint).

The default maximum lifetime is 10 hours.

{%- endif %}

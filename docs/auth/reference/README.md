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

### Endpoints

NAIS provides the following endpoints under your application's [ingress](../../workloads/reference/ingress.md) to help you authenticate [employees](../entra-id/how-to/login.md) or [citizens](../idporten/how-to/login.md).

| Path                                    | Description                                                                                         | Details                                               |
|-----------------------------------------|-----------------------------------------------------------------------------------------------------|-------------------------------------------------------|
| `GET <ingress>/oauth2/login`            | Redirect the user agent here to initiate login.                                                     | [Login endpoint](#login-endpoint)                     |
| `GET <ingress>/oauth2/logout`           | Redirect the user agent here to initiate logout.                                                    | [Logout endpoint](#logout-endpoint)                   |
| `GET <ingress>/oauth2/session`          | Request from user agent. Returns the current user's session metadata                                | [Session endpoint](#session-endpoint)                 |
| `POST <ingress>/oauth2/session/refresh` | Request from user agent. Refreshes the tokens and returns the session metadata for the current user | [Session refresh endpoint](#session-refresh-endpoint) |

#### Login endpoint

This endpoint handles the authentication flow. It is available at:

```http
https://<ingress>/oauth2/login
```

To log in a human, redirect them to this endpoint.
By default, they will be redirected back to the matching context path for your application's ingress:

- `/` for `https://<app>.nav.no`
- `/path` for `https://nav.no/path`

To override this, use the `redirect` parameter to specify a different absolute path:

```
https://<ingress>/oauth2/login?redirect=/some/path
```

If you include query parameters, ensure that they are URL encoded.

#### Logout endpoint

This endpoint triggers single-logout. It is available at:

```http
https://<ingress>/oauth2/logout
```

To log out a human, redirect them to this endpoint.
By default, they will be redirected back to a preconfigured URL.

To override this, use the `redirect` parameter to specify a different absolute path:

```
https://<ingress>/oauth2/login?redirect=/some/path
```

If you include query parameters, ensure that they are URL encoded.

#### Session endpoint

This endpoint returns metadata about the human's [session](../explanations/README.md#sessions) as a JSON object.
Requests to this endpoint must be triggered from the user agent.

```http title="Request"
GET /oauth2/session
```

```http title="Response"
HTTP/2 200 OK
Content-Type: application/json

{
  "session": {
    "created_at": "2022-08-31T06:58:38.724717899Z", 
    "ends_at": "2022-08-31T16:58:38.724717899Z",
    "timeout_at": "0001-01-01T00:00:00Z",
    "ends_in_seconds": 14658,
    "active": true,
    "timeout_in_seconds": -1
  },
  "tokens": {
    "expire_at": "2022-08-31T14:03:47.318251953Z",
    "refreshed_at": "2022-08-31T12:53:58.318251953Z",
    "expire_in_seconds": 4166
    "next_auto_refresh_in_seconds": -1,
    "refresh_cooldown": false,
    "refresh_cooldown_seconds": 0
  }
}
```

The table below describes the different fields in the JSON response.

??? note "Session Metadata Field Descriptions (click to expand)"

    | Field                                 | Description                                                                                                                                                   |
    |---------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------|
    | `session.active`                      | Whether or not the session is marked as active. If `false`, the session cannot be extended and the user must be redirected to login.                          |
    | `session.created_at`                  | The timestamp that denotes when the session was first created.                                                                                                |
    | `session.ends_at`                     | The timestamp that denotes when the session will end. After this point, the session cannot be extended and the user must be redirected to login.              |
    | `session.ends_in_seconds`             | The number of seconds until `session.ends_at`.                                                                                                                |
    | `session.timeout_at`                  | The timestamp that denotes when the session will time out. The zero-value, `0001-01-01T00:00:00Z`, means no timeout.                                          |
    | `session.timeout_in_seconds`          | The number of seconds until `session.timeout_at`. A value of `-1` means no timeout.                                                                           |
    | `tokens.expire_at`                    | The timestamp that denotes when the tokens within the session will expire.                                                                                    |
    | `tokens.expire_in_seconds`            | The number of seconds until `tokens.expire_at`.                                                                                                               |
    | `tokens.refreshed_at`                 | The timestamp that denotes when the tokens within the session was last refreshed.                                                                             |
    | `tokens.next_auto_refresh_in_seconds` | The number of seconds until the earliest time where the tokens will automatically be refreshed. A value of -1 means that automatic refreshing is not enabled. |
    | `tokens.refresh_cooldown`             | A boolean indicating whether or not the refresh operation is on cooldown or not.                                                                              |
    | `tokens.refresh_cooldown_seconds`     | The number of seconds until the refresh operation is no longer on cooldown.                                                                                   |

This endpoint will respond with the following HTTP status codes on errors:

- `HTTP 401 Unauthorized` - no session cookie or matching session found, or maximum lifetime reached
- `HTTP 500 Internal Server Error` - the login proxy wasn't able to process the request

Otherwise, an `HTTP 200 OK` is returned with the metadata with the `application/json` as the `Content-Type`.

Note that this endpoint will still return `HTTP 200 OK` for _inactive_ sessions, as long as the session is not _expired_.
This allows application to display errors before redirecting the user to login on timeouts.

This also means that you should not use the HTTP response status codes alone as an indication of whether the user is authenticated or not.

#### Session refresh endpoint

This endpoint allows for refreshing the human's session on demand.
Requests to this endpoint must be triggered from the user agent.

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
    "created_at": "2022-08-31T06:58:38.724717899Z", 
    "ends_at": "2022-08-31T16:58:38.724717899Z",
    "timeout_at": "0001-01-01T00:00:00Z",
    "ends_in_seconds": 14658,
    "active": true,
    "timeout_in_seconds": -1
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

### Autologin exclusions

[Autologin](../explanations/README.md#autologin) will by default match all paths for your application's ingresses, except the following:

- `/oauth2/*`
- [`spec.prometheus.path`](../../workloads/application/reference/application-spec.md#prometheuspath), if defined
- [`spec.liveness.path`](../../workloads/application/reference/application-spec.md#livenesspath), if defined
- [`spec.readiness.path`](../../workloads/application/reference/application-spec.md#readinesspath), if defined

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

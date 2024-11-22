To validate a token, you can either:

- [validate tokens with Texas](#validate-with-texas), or
- [validate JWTs manually](#validate-jwt-manually) in your application

#### Validate with Texas

{% set endpoint_env_var = 'NAIS_TOKEN_INTROSPECTION_ENDPOINT' %}
{% include 'auth/partials/texas-header.md' %}

| Parameter           | Example Value           | Description                            |
|:--------------------|:------------------------|:---------------------------------------|
| `identity_provider` | `<<identity_provider>>` | Always `<<identity_provider>>`.        |
| `token`             | `eyJra...`              | The access token you wish to validate. |

=== "application/json"

    ```http title="Token request"
    POST ${<<endpoint_env_var>>} HTTP/1.1
    Content-Type: application/json

    {
        "identity_provider": "<<identity_provider>>",
        "token": "eyJra..."
    }
    ```

=== "application/x-www-form-urlencoded"

    ```http title="Token request"
    POST ${<<endpoint_env_var>>} HTTP/1.1
    Content-Type: application/x-www-form-urlencoded

    identity_provider=<<identity_provider>>&
    token=eyJra...
    ```

The response is always a HTTP 200 OK response with a JSON body.

It always contains the `active` field, which is a boolean value that indicates whether the token is valid or not.

If the token is valid, the response will also contain all the token's claims:

```json title="Valid token"
{
    "active": true,
    "exp": 1730980893,
    "iat": 1730977293,
    ...
}
```

If the token is invalid, the only additional field in the response is the `error` field:

```json title="Invalid token"
{
    "active": false,
    "error": "token is expired"
}
```

The `error` field contains a human-readable error message that describes why the token is invalid.

#### Validate JWT manually

Validating a JWT involves a number of steps.
These steps are outlined and described below in a language- and framework-agnostic way.

!!! tip "Libraries for token validation"

    We recommend using a library in your language of choice to handle all the validation steps described below.
    Here are some recommended libraries:

    - [navikt/oasis](https://github.com/navikt/oasis) (JavaScript)
    - [navikt/token-support](https://github.com/navikt/token-support) (Java / Kotlin)

    Validation is also supported by many popular frameworks:

    - [Ktor](https://ktor.io/docs/server-jwt.html) (Kotlin)
    - [Spring Security](https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/jwt.html) (Java / Kotlin)

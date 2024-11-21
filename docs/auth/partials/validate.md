**Texas**

???+ warning "Token Exchange as a Service (Texas) is in public beta."

    To enable for your application, set the `texas.nais.io=enabled` annotation on your `Application`.

<<gcp_only("Texas")>>

Texas is [Token Exchange as a Service](../../explanations/README.md#texas), aimed to make it easier to deal with tokens.

Send a HTTP POST request to the endpoint described in the `$NAIS_TOKEN_INTROSPECT_ENDPOINT` environment variable.
Set `target` to the access token you wish to validate.

```json
{
    "identity_provider": "<IDENTITY_PROVIDER>",
    "token": "eyJra..."
}
```

If the token is valid, you will get a response containing all the token's claims, in addition to an extra field `active=true`:

```json
{
    "active": true,
    "aud": "my-target",
    "azp": "yolo",
    "exp": 1730980893,
    "iat": 1730977293,
    "iss": "http://localhost:8080/tokenx",
    "jti": "e7cbadc3-6bda-49c0-a196-c47328da880e",
    "nbf": 1730977293,
    "sub": "e015542c-0f81-40f5-bbd9-7c3d9366298f",
    "tid": "tokenx"
}
```

On the other hand, if the token is invalid due to any reason, the response will contain the field `active=false`,
in addition to a human-readable error message describing the situation:

```json
{
    "active": false,
    "error": "token is expired",
}
```

**JWT Validation**

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

To validate a token, you can either:

- use [Token Exchange as a Service](../../explanations/README.md#texas) (_Texas_), or
- manually perform JWT validation in your application

**Texas**

???+ warning "Texas is in public beta"

    To enable for your application, set the `texas.nais.io/enabled: "true"` annotation on your `Application`.

Send a HTTP POST request to the endpoint described in the `$NAIS_TOKEN_INTROSPECTION_ENDPOINT` environment variable.

- Set `token` to the access token you wish to validate
- Set `identity_provider` to the identity provider that you wish to validate against (one of `azuread`, `idporten`, `maskinporten`, `tokenx`)

For the complete API documentation, see [Texas OpenAPI reference](../../reference/texas.md).

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
    "aud": "<client-id>",
    "exp": 1730980893,
    "iat": 1730977293,
    ...
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

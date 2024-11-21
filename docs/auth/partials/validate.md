To validate a token, you can either:

- [validate tokens with Texas](#validate-with-texas), or
- [validate JWTs manually](#validate-jwt-manually) in your application

#### Validate with Texas

???+ warning "[Token Exchange as a Service](../../explanations/README.md#texas) (Texas) is in public beta"

    To enable for your application, set the `texas.nais.io/enabled: "true"` annotation on your `Application`.

Send a HTTP POST request to the endpoint described in the `$NAIS_TOKEN_INTROSPECTION_ENDPOINT` environment variable.

- Set `token` to the access token you wish to validate
- Set `identity_provider` to the identity provider that you wish to validate against (one of `azuread`, `idporten`, `maskinporten`, `tokenx`)

For the complete API documentation, see [Texas reference](../../reference/README.md#texas).

```json
{
    "identity_provider": "<IDENTITY_PROVIDER>",
    "token": "eyJra..."
}
```

The response is a JSON object.
It always contains the field `active` with a boolean value that indicates whether the token is valid or not.

If the token is valid, the response will also contain all the token's claims:

```json
{
    "active": true,
    "aud": "<client-id>",
    "exp": 1730980893,
    "iat": 1730977293,
    ...
}
```

If the token is invalid, the only additional field in the response is the `error` field:

```json
{
    "active": false,
    "error": "token is expired",
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

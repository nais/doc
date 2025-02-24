While we recommend using [the `NAIS_TOKEN_INTROSPECTION_ENDPOINT` endpoint for validating tokens](#runtime-variables-credentials),
you can alternatively validate tokens manually in your application.

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

To validate the token, start by validating the [signature and standard time-related claims](../../explanations/README.md#token-validation).

Additionally, perform the following validations:

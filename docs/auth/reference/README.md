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

## Token Generators

In some cases, you want to locally develop and test against a secured API in the development environments.
You will need a token to access said API.

See the respective identity provider pages for details on acquiring such tokens:

- [Entra ID](../entra-id/how-to/generate.md)
- [TokenX](../tokenx/how-to/generate.md)

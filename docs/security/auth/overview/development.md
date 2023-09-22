# Development

## Mocking

- <https://github.com/navikt/mock-oauth2-server>
- <https://github.com/navikt/fakedings> - a wrapper around the above mock server

## Libraries and Frameworks

Below is a list of some well-known and widely used libraries for handling OAuth, OpenID Connect, and token validation.

### JVM

- <https://github.com/navikt/token-support>
- <https://ktor.io/docs/jwt.html>
- <https://spring.io/projects/spring-security-oauth>
- <https://github.com/pac4j/pac4j>
- <https://connect2id.com/products/nimbus-oauth-openid-connect-sdk>

### JavaScript

- <https://github.com/panva/jose>
- <https://github.com/panva/node-openid-client>

See also <https://jwt.io/libraries> for a non-comprehensive list for many various languages.

## Test Clients

If mocking isn't sufficient, we also maintain some test clients for use in local development environments.

Note that the associated credentials may be rotated at any time.

As developers, you're responsible for treating these credentials as secrets. Never commit or distribute these to
version control or expose them to publicly accessible services.

See the respective identity provider pages for details:

- [Azure AD](../azure-ad/usage.md#test-clients)
- [TokenX](../tokenx.md#test-clients)

## Token Generators

In many cases, you want to locally develop and test against a secured API (or [resource server](../concepts/actors.md#resource-server)) in the development environments.
To do so, you need a [token](../concepts/tokens.md#bearer-token) in order to access said API.

See the respective identity provider pages for details:

- [Azure AD](../azure-ad/usage.md#token-generator)
- [TokenX](../tokenx.md#token-generator)

# Development

## Mocking

- <https://github.com/navikt/mock-oauth2-server>
- <https://github.com/navikt/fakedings> - a wrapper around the above mock server

## Libraries and Frameworks

Below is a list of some well-known and widely used libraries for handling OAuth, OpenID Connect, and token validation.

### JVM

- <https://github.com/navikt/token-support>
- <https://ktor.io/docs/oauth.html>
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

### ID-porten

Credentials are found in Vault under [/secrets/secret/.common/idporten](https://vault.adeo.no/ui/vault/secrets/secret/show/.common/idporten) 

The client is configured with the following redirect URIs:

- `http://localhost:3000/oauth2/callback`

It is otherwise equal to a [default client](../idporten/README.md).

### Azure AD

Credentials are found in Vault under [/secrets/secret/.common/azure](https://vault.adeo.no/ui/vault/secrets/secret/list/.common/azure/)

The clients are configured with the following redirect URIs:

- `http://localhost:3000/oauth2/callback`

The clients are [pre-authorized](../azure-ad/access-policy.md#pre-authorization) as follows:

- `test-app-1` is pre-authorized for `test-app-2`
- `test-app-2` is pre-authorized for `test-app-3`

They are otherwise equal to a [default client](../azure-ad/configuration.md).

### TokenX

Credentials are found in Vault under [/secrets/secret/.common/tokenx](https://vault.adeo.no/ui/vault/secrets/secret/list/.common/tokenx/)

The clients are [pre-authorized](../tokenx.md#access-policies) as follows:

- `app-1` is pre-authorized for `app-2`

They are otherwise equal to a [default client](../tokenx.md#configuration).

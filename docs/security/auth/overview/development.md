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

### ID-porten

Credentials are found in Vault under [/secrets/secret/.common/idporten](https://vault.adeo.no/ui/vault/secrets/secret/show/.common/idporten) 

The client is configured with the following redirect URIs:

- `http://localhost:3000/oauth2/callback`

It is otherwise equal to a [default client](../idporten.md).

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

## Token Generators

In many cases, you want to locally develop and test against a secured API (or [resource server](../concepts/actors.md#resource-server)) in the development environments.
To do so, you need a [token](../concepts/tokens.md#bearer-token) in order to access said API.

The services below can be used in order to generate tokens in the development environments.

### Azure AD

The service is available at <https://azure-token-generator.intern.dev.nav.no>.

#### Prerequisites

1. You will need a [trygdeetaten.no](../azure-ad/concepts.md#tenants) user in order to access the service.
2. The API application must be configured with [Azure enabled](../azure-ad/configuration.md).
3. Pre-authorize the token generator service by adding it to the API application's [access policy](../azure-ad/access-policy.md#pre-authorization):
    ```yaml
    spec:
      accessPolicy:
        inbound:
          rules:
            - application: azure-token-generator
              namespace: aura
              cluster: dev-gcp
    ```

#### Getting a token

The Azure AD token generator supports two use cases:

1. The [on-behalf-of grant](../azure-ad/usage.md#oauth-20-on-behalf-of-grant) - for getting a token on-behalf-of a logged in end-user.
2. The [client credentials grant](../azure-ad/usage.md#oauth-20-client-credentials-grant) - for getting a machine-to-machine token.

=== "1. On-Behalf-Of"

    1. Visit <https://azure-token-generator.intern.dev.nav.no/api/obo?aud=&lt;audience&gt;> in your browser.
        - Replace `<audience>` with the intended _audience_ of the token, in this case the API application.
        - The audience value must be on the form of `<cluster>.<namespace>.<application>`
        - For example: `dev-gcp.aura.my-app`
    2. You will be redirected to log in at Azure AD (if not already logged in).
    3. After logging in, you should be redirected back to the token generator and presented with a JSON response containing an `access_token`.
    4. Use the `access_token` as a [Bearer token](../concepts/tokens.md#bearer-token) for calls to your API application.
    5. Success!

=== "2. Client Credentials"

    1. Visit <https://azure-token-generator.intern.dev.nav.no/api/m2m?aud=&lt;audience&gt;> in your browser.
        - Replace `<audience>` with the intended _audience_ of the token, in this case the API application.
        - The audience value must be on the form of `<cluster>.<namespace>.<application>`
        - For example: `dev-gcp.aura.my-app`
    2. You will be redirected to log in at Azure AD (if not already logged in).
    3. After logging in, you should be redirected back to the token generator and presented with a JSON response containing an `access_token`.
    4. Use the `access_token` as a [Bearer token](../concepts/tokens.md#bearer-token) for calls to your API application.
    5. Success!

### TokenX

The service is available at <https://tokenx-token-generator.intern.dev.nav.no>.

#### Prerequisites

1. The API application must be configured with [TokenX enabled](../tokenx.md).
2. Pre-authorize the token generator service by adding it to the API application's [access policy](../tokenx.md#access-policies):
    ```yaml
    spec:
      accessPolicy:
        inbound:
          rules:
            - application: tokenx-token-generator
              namespace: aura
              cluster: dev-gcp
    ```

#### Getting a token

1. Visit <https://tokenx-token-generator.intern.dev.nav.no/api/obo?aud=&lt;audience&gt;> in your browser.
    - Replace `<audience>` with the intended _audience_ of the token, in this case the API application.
    - The audience value must be on the form of `<cluster>:<namespace>:<application>`
    - For example: `dev-gcp:aura:my-app`
2. You will be redirected to log in at ID-porten (if not already logged in).
3. After logging in, you should be redirected back to the token generator and presented with a JSON response containing an `access_token`.
4. Use the `access_token` as a [Bearer token](../concepts/tokens.md#bearer-token) for calls to your API application.
5. Success!

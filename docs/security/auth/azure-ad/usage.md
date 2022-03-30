# Usage

## Use Cases

An Azure AD client allows your application to leverage Azure AD for authentication and/or authorization. The following
sections will describe the recommended flows and grants to be used for applications running on the platform.

### OpenID Connect Authorization Code Flow

This flow is used for sign-in and authentication of end users (NAV employees only) with single-sign on (SSO).

See [Microsoft identity platform and OAuth 2.0 authorization code flow](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow).

We generally recommend that you use the [sidecar](sidecar.md) instead of implementing this yourselves.

### OAuth 2.0 On-Behalf-Of Grant

This grant is used for machine-to-machine requests chains initiated by an end user. The end user's identity and 
permissions should be propagated through each service/web API.

#### Prerequisites

1. Your [resource server](../concepts/actors.md#resource-server) / API and any downstream API that your API consumes are registered in Azure AD.
2. Your resource server has been [pre-authorized](access-policy.md#pre-authorization) by the downstream API.

#### Steps

1. Your resource server receives an [access token](../concepts/tokens.md#access-token) in a request from a consumer
   with `aud` (audience) [claim](../concepts/tokens.md#claims-validation) equal to your own client ID. 
     - This token contains the end user context, e.g. from the [Authorization Code Flow](#openid-connect-authorization-code-flow)
     or from a previous resource server that has also performed the On-Behalf-Of grant.
2. Your resource server [requests a new token](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-on-behalf-of-flow#middle-tier-access-token-request) 
   from Azure AD that is [scoped](concepts.md#scopes) to the downstream API that should be consumed.
     - The `scope` parameter in the request should thus be `api://<cluster>.<namespace>.<app-name>/.default`
     - The token returned from Azure AD will have an `aud` claim with a value equal to the client ID of the downstream API. Your resource server does not need to validate this token.
3. Your resource server performs the request to the downstream API by using the token as a [Bearer token](../concepts/tokens.md#bearer-token).
4. Repeat step 2 and 3 for each unique API that your application consumes.
5. The downstream API(s) may continue the call chain starting from step 1.

See [Microsoft identity platform and OAuth 2.0 On-Behalf-Of flow](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-on-behalf-of-flow).

### OAuth 2.0 Client Credentials Grant

This grant is used for pure machine-to-machine authentication, i.e. interactions without an end user involved.

#### Prerequisites

1. Your [client](../concepts/actors.md#client) and any [downstream API](../concepts/actors.md#resource-server) that your client consumes are registered in Azure AD.
2. Your client has been [pre-authorized](access-policy.md#pre-authorization) by the downstream API.

#### Steps

1. Your resource server [requests a new token](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-client-creds-grant-flow#get-a-token)
   from Azure AD that is [scoped](concepts.md#scopes) to the downstream API that should be consumed.
     - The `scope` parameter in the request should thus be `api://<cluster>.<namespace>.<app-name>/.default`
     - The token returned from Azure AD will have an `aud` (audience) [claim](../concepts/tokens.md#claims-validation) with a value equal to the client ID of the downstream API. Your client does not need to validate this token.
2. Your resource server performs the request to the downstream API by using the token as a [Bearer token](../concepts/tokens.md#bearer-token).
3. Repeat step 1 and 2 for each unique API that your application consumes.
4. The downstream API(s) may continue the call chain by starting from step 1.

See [Microsoft identity platform and the OAuth 2.0 client credentials flow](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-client-creds-grant-flow).

## Client Authentication

In order to fetch tokens from Azure AD, your application should [authenticate itself](../concepts/actors.md#client-authentication).
This can be done using either a client secret or a client assertion.

### Client Secret

See [client secret](../concepts/actors.md#client-secret) for general information.

For Azure AD specifics, consult their documentation:

- [OAuth 2.0 Client Credentials Grant](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-client-creds-grant-flow#first-case-access-token-request-with-a-shared-secret)
- [OAuth 2.0 On-Behalf-Of Flow](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-on-behalf-of-flow#first-case-access-token-request-with-a-shared-secret)
- [OpenID Connect Authorization Code Grant](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow#request-an-access-token-with-a-client_secret)

### Client Assertion

See [client assertion](../concepts/actors.md#client-assertion) for general information.

For Azure AD specifics, consult their documentation:

- [OAuth 2.0 Client Credentials Grant](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-client-creds-grant-flow#second-case-access-token-request-with-a-certificate)
- [OAuth 2.0 On-Behalf-Of Flow](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-on-behalf-of-flow#second-case-access-token-request-with-a-certificate)
- [OpenID Connect Authorization Code Grant](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow#request-an-access-token-with-a-certificate-credential)

## Runtime Variables & Credentials

The following environment variables and files \(under the directory `/var/run/secrets/nais.io/azure`\) are available at runtime:

---

### `AZURE_APP_CLIENT_ID`

???+ note

    [Client ID](../concepts/actors.md#client-id) that uniquely identifies the application in Azure AD.
    
    Example value: `e89006c5-7193-4ca3-8e26-d0990d9d981f`

---

### `AZURE_APP_CLIENT_SECRET`

???+ note

    [Client secret](../concepts/actors.md#client-secret) for the application in Azure AD for [client authentication](#client-authentication).

    Example value: `b5S0Bgg1OF17Ptpy4_uvUg-m.I~KU_.5RR`

---

### `AZURE_APP_JWKS`

???+ note

    A private [JWK Set (JWKS)](../concepts/cryptography.md#private-keys). This set is just a wrapper around a single key, i.e. [`AZURE_APP_JWK`](#azure_app_jwk) and will only contain one key at all times.

    Example value: 

    ```javascript
    {
      "keys": [
        {
            "use": "sig",
            "kty": "RSA",
            "kid": "jXDxKRE6a4jogcc4HgkDq3uVgQ0",
            "n": "xQ3chFsz...",
            "e": "AQAB",
            "d": "C0BVXQFQ...",
            "p": "9TGEF_Vk...",
            "q": "zb0yTkgqO...",
            "dp": "7YcKcCtJ...",
            "dq": "sXxLHp9A...",
            "qi": "QCW5VQjO...",
            "x5c": [
              "MIID8jCC..."
            ],
            "x5t": "jXDxKRE6a4jogcc4HgkDq3uVgQ0",
            "x5t#S256": "AH2gbUvjZYmSQXZ6-YIRxM2YYrLiZYW8NywowyGcxp0"
        }
      ]
    }
    ``` 

---

### `AZURE_APP_JWK`

???+ note

    [Private JWK](../concepts/cryptography.md#private-keys) containing an RSA key belonging to your client. Used to sign client assertions during [client authentication](#client-authentication).

    Example value: 

    ```javascript
    {
      "use": "sig",
      "kty": "RSA",
      "kid": "jXDxKRE6a4jogcc4HgkDq3uVgQ0",
      "n": "xQ3chFsz...",
      "e": "AQAB",
      "d": "C0BVXQFQ...",
      "p": "9TGEF_Vk...",
      "q": "zb0yTkgqO...",
      "dp": "7YcKcCtJ...",
      "dq": "sXxLHp9A...",
      "qi": "QCW5VQjO...",
      "x5c": [
        "MIID8jCC..."
      ],
      "x5t": "jXDxKRE6a4jogcc4HgkDq3uVgQ0",
      "x5t#S256": "AH2gbUvjZYmSQXZ6-YIRxM2YYrLiZYW8NywowyGcxp0"
    }
    ```

---

### `AZURE_APP_PRE_AUTHORIZED_APPS`

???+ note

    A JSON string. List of names and client IDs for the valid \(i.e. those that exist in Azure AD\) applications defined in [`spec.accessPolicy.inbound.rules[]`](access-policy.md)
    
    Example value: 

    ```javascript
    [
      {
        "name": "dev-gcp:othernamespace:app-a",
        "clientId": "381ce452-1d49-49df-9e7e-990ef0328d6c"
      },
      {
        "name": "dev-gcp:aura:app-b",
        "clientId": "048eb0e8-e18a-473a-a87d-dfede7c65d84"
      }
    ]
    ```

---

### `AZURE_APP_TENANT_ID`

???+ note

    The [tenant ID](concepts.md#tenants) for which the Azure AD client resides in.

    Example value: `77678b69-1daf-47b6-9072-771d270ac800` 

---

### `AZURE_APP_WELL_KNOWN_URL`

???+ note

   The well-known URL for the [OIDC metadata discovery document](../concepts/actors.md#well-known-url-metadata-document) for the Azure AD tenant that the client is registered in.

    Example value: `https://login.microsoftonline.com/77678b69-1daf-47b6-9072-771d270ac800/v2.0/.well-known/openid-configuration`

---

### `AZURE_OPENID_CONFIG_ISSUER`

???+ note

    `issuer` from the [metadata discovery document](../concepts/actors.md#issuer).

    Example value: `https://login.microsoftonline.com/77678b69-1daf-47b6-9072-771d270ac800/v2.0`

---

### `AZURE_OPENID_CONFIG_JWKS_URI`

???+ note

    `jwks_uri` from the [metadata discovery document](../concepts/actors.md#jwks-endpoint-public-keys).

    Example value: `https://login.microsoftonline.com/77678b69-1daf-47b6-9072-771d270ac800/discovery/v2.0/keys`

---

### `AZURE_OPENID_CONFIG_TOKEN_ENDPOINT`

???+ note

    `token_endpoint` from the [metadata discovery document](../concepts/actors.md#token-endpoint).

    Example value: `https://login.microsoftonline.com/77678b69-1daf-47b6-9072-771d270ac800/oauth2/v2.0/token`

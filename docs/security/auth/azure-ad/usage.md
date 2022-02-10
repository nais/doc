# Usage

!!! info
    **See the** [**NAV Security Guide**](https://security.labs.nais.io/pages/idp/azure-ad.html) **for NAV-specific usage.**

## Runtime Variables & Credentials

The following environment variables and files \(under the directory `/var/run/secrets/nais.io/azure`\) are available at runtime:

---

### `AZURE_APP_CLIENT_ID`

???+ note

    Azure AD client ID. Unique ID for the application in Azure AD
    
    Example value: `e89006c5-7193-4ca3-8e26-d0990d9d981f`

---

### `AZURE_APP_CLIENT_SECRET`

???+ note

    Azure AD client secret, i.e. password for [authenticating the application to Azure AD](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-client-creds-grant-flow#first-case-access-token-request-with-a-shared-secret) 

    Example value: `b5S0Bgg1OF17Ptpy4_uvUg-m.I~KU_.5RR`

---

### `AZURE_APP_JWKS`

???+ note

    A JWK Set as defined in [RFC7517 section 5](https://tools.ietf.org/html/rfc7517#section-5). This will always contain a single key, i.e. `AZURE_APP_JWK` - the newest key registered.

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

    Private JWK as defined in [RFC7517](https://tools.ietf.org/html/rfc7517), i.e. a JWK with the private RSA key for creating signed JWTs when [authenticating to Azure AD with a certificate](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-client-creds-grant-flow#second-case-access-token-request-with-a-certificate).

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

    The Azure AD tenant ID for which the Azure AD client resides in. 

    Example value: `77678b69-1daf-47b6-9072-771d270ac800` 

---

### `AZURE_APP_WELL_KNOWN_URL`

???+ note

    The well-known URL to the [metadata discovery document](https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderConfig) for the specific tenant in which the Azure AD client resides in.

    Example value: `https://login.microsoftonline.com/77678b69-1daf-47b6-9072-771d270ac800/v2.0/.well-known/openid-configuration`

---

### `AZURE_OPENID_CONFIG_ISSUER`

???+ note

    `issuer` from the metadata discovery document.

    Example value: `https://login.microsoftonline.com/77678b69-1daf-47b6-9072-771d270ac800/v2.0`

---

### `AZURE_OPENID_CONFIG_JWKS_URI`

???+ note

    `jwks_uri` from the metadata discovery document.

    Example value: `https://login.microsoftonline.com/77678b69-1daf-47b6-9072-771d270ac800/discovery/v2.0/keys`

---

### `AZURE_OPENID_CONFIG_TOKEN_ENDPOINT`

???+ note

    `token_endpoint` from the metadata discovery document.

    Example value: `https://login.microsoftonline.com/77678b69-1daf-47b6-9072-771d270ac800/oauth2/v2.0/token`

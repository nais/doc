!!! tip "Recommended JavaScript Library"

    See <https://github.com/navikt/oasis> that helps with token validation and exchange in JavaScript applications.

To validate the token, start by validating the [signature and standard time-related claims](../../explanations/README.md#token-validation).
Additionally, perform the following validations:

**Issuer Validation**

Validate that the `iss` claim has a value that is equal to either:

1. the `AZURE_OPENID_CONFIG_ISSUER` [environment variable](../reference/README.md#runtime-variables-credentials), or
2. the `issuer` property from the [metadata discovery document](../../explanations/README.md#well-known-url-metadata-document).
   The document is found at the endpoint pointed to by the `AZURE_APP_WELL_KNOWN_URL` environment variable.

**Audience Validation**

Validate that the `aud` claim is equal to the `AZURE_APP_CLIENT_ID` environment variable.

**Signature Validation**

Validate that the token is signed with a public key published at the JWKS endpoint.
This endpoint URI can be found in one of two ways:

1. the `AZURE_OPENID_CONFIG_JWKS_URI` environment variable, or
2. the `jwks_uri` property from the metadata discovery document.
   The document is found at the endpoint pointed to by the `AZURE_APP_WELL_KNOWN_URL` environment variable.

**Claims Validation**

[Other claims](../reference/README.md#claims) may be present in the token. Validation of these claims is optional.

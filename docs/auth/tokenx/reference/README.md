---
tags: [tokenx, reference]
---

# TokenX reference

## Claims

In addition to the [standard claims](../../explanations/README.md#claims-validation), tokens from TokenX include the following claims:

| Claim       | Description                                                                                                                                                    |
|:------------|:---------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `idp`       | The original [`issuer`](../../explanations/README.md#issuer) of the subject token                                                                              |
| `client_id` | The consumer's [`client_id`](../../explanations/README.md#client-id) using the naming scheme `<cluster>:<namespace>:<appname>` e.g. `prod-gcp:namespace1:app1` |

Other claims such as `pid` are copied verbatim from the [original token issued by ID-porten](../../../security/auth/idporten.md#other-token-claims).

### Claim Mappings

Some claims are mapped to a different value for legacy/compatibility reasons.

The table below shows the claim mappings:

| Claim | Original Value             | Mapped Value  |
|:------|:---------------------------|:--------------|
| `acr` | `idporten-loa-substantial` | `Level3`      |
| `acr` | `idporten-loa-high`        | `Level4`      |

The mappings will be removed at some point in the future.
If you're using the `acr` claim in any way, check for both the original and mapped values.

## Runtime Variables & Credentials

Your application will automatically be injected with environment variables at runtime.

### Variables for acquiring tokens

These variables are used to [:dart: consume an API](../how-to/consume.md):

| Name                     | Description                                                                                               |
|:-------------------------|:----------------------------------------------------------------------------------------------------------|
| `TOKEN_X_CLIENT_ID`      | [Client ID](../../explanations/README.md#client-id) that uniquely identifies the application in TokenX.   |
| `TOKEN_X_PRIVATE_JWK`    | [Private JWK](../../explanations/README.md#private-keys) containing an RSA key belonging to client.       |
| `TOKEN_X_TOKEN_ENDPOINT` | `token_endpoint` from the [metadata discovery document](../../explanations/README.md#token-endpoint).     |

### Variables for validating tokens

These variables are used to [:dart: secure your API](../how-to/secure.md):

| Name                     | Description                                                                                                           |
|:-------------------------|:----------------------------------------------------------------------------------------------------------------------|
| `TOKEN_X_CLIENT_ID`      | [Client ID](../../explanations/README.md#client-id) that uniquely identifies the application in TokenX.               |
| `TOKEN_X_WELL_KNOWN_URL` | The URL for Tokendings' [metadata discovery document](../../explanations/README.md#well-known-url-metadata-document). |
| `TOKEN_X_ISSUER`         | `issuer` from the [metadata discovery document](../../explanations/README.md#issuer).                                 |
| `TOKEN_X_JWKS_URI`       | `jwks_uri` from the [metadata discovery document](../../explanations/README.md#jwks-endpoint-public-keys).            |

## Spec

See the [:books: NAIS application reference](../../../workloads/application/reference/application-spec.md#tokenx).

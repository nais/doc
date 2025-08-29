---
tags: [tokenx, reference]
conditional: [tenant, nav]
---

# TokenX reference

## Spec

See the [:books: Nais application reference](../../../workloads/application/reference/application-spec.md#tokenx).

## Runtime variables & credentials

Your application will automatically be injected with environment variables at runtime.

| Environment Variable                | Description                                                                     |
|-------------------------------------|---------------------------------------------------------------------------------|
| `NAIS_TOKEN_EXCHANGE_ENDPOINT`      | Used to [:dart: consume an API on behalf of an end-user](../how-to/consume.md). |
| `NAIS_TOKEN_INTROSPECTION_ENDPOINT` | Used to [:dart: secure your API with TokenX](../how-to/secure.md).              |

For further details about these endpoints, see the [OpenAPI specification](../../reference/README.md#openapi-specification).

### Variables for manually validating tokens

These variables are optional and should only be used for [manually validating tokens](#manual-token-validation) when :dart: [securing your API with TokenX](../how-to/secure.md).

| Name                     | Description                                                                                                              |
|:-------------------------|:-------------------------------------------------------------------------------------------------------------------------|
| `TOKEN_X_CLIENT_ID`      | [Client ID](../../explanations/README.md#client-id) that uniquely identifies the application in TokenX.                  |
| `TOKEN_X_WELL_KNOWN_URL` | The well-known URL for the [metadata discovery document](../../explanations/README.md#well-known-url-metadata-document). |
| `TOKEN_X_ISSUER`         | `issuer` from the [metadata discovery document](../../explanations/README.md#issuer).                                    |
| `TOKEN_X_JWKS_URI`       | `jwks_uri` from the [metadata discovery document](../../explanations/README.md#jwks-endpoint-public-keys).               |

`TOKEN_X_WELL_KNOWN_URL` is optional if you're using `TOKEN_X_ISSUER` and `TOKEN_X_JWKS_URI` directly.

## Claims

In addition to the [standard claims](../../explanations/README.md#claims-validation), tokens from TokenX include the following claims:

| Claim       | Description                                                                                                                       |
|:------------|:----------------------------------------------------------------------------------------------------------------------------------|
| `idp`       | The original [`issuer`](../../explanations/README.md#issuer) of the subject token                                                 |
| `client_id` | The consumer's [`client_id`](../../explanations/README.md#client-id). Follows the naming scheme `<cluster>:<namespace>:<appname>` |

Other claims such as `pid` and `acr` are copied verbatim from the [original token issued by ID-porten](../../idporten/reference/README.md#claims).

### Claim Mappings

Some claims are mapped to a different value for legacy/compatibility reasons.

The table below shows the claim mappings:

| Claim | Original Value             | Mapped Value  |
|:------|:---------------------------|:--------------|
| `acr` | `idporten-loa-substantial` | `Level3`      |
| `acr` | `idporten-loa-high`        | `Level4`      |

The mappings will be removed at some point in the future.
If you're using the `acr` claim in any way, check for both the original and mapped values.

## Manual token validation

{% include 'auth/partials/validate-manually.md' %}

**Issuer validation**

Validate that the `iss` claim has a value that is equal to either:

1. the `TOKEN_X_ISSUER` environment variable, or
2. the `issuer` property from the [metadata discovery document](../../explanations/README.md#well-known-url-metadata-document).
   The document is found at the endpoint pointed to by the `TOKEN_X_WELL_KNOWN_URL` environment variable.

**Audience validation**

Validate that the `aud` claim is equal to the value found in the `TOKEN_X_CLIENT_ID` environment variable.

**Signature validation**

Validate that the token is signed with a public key published at the JWKS endpoint.
This endpoint URI can be found in one of two ways:

1. the `TOKEN_X_JWKS_URI` environment variable, or
2. the `jwks_uri` property from the metadata discovery document.
   The document is found at the endpoint pointed to by the `TOKEN_X_WELL_KNOWN_URL` environment variable.

**Claims validation**

[Other claims](#claims) may be present in the token.
Your application should validate these other claims according to your own requirements.

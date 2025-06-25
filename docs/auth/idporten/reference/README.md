---
tags: [idporten, reference]
conditional: [tenant, nav]
---

# ID-porten reference

## Spec

For all possible configuration options, see the [:books: Nais application reference](../../../workloads/application/reference/application-spec.md#idporten).

## Runtime variables & credentials

Your application will automatically be injected with the following environment variables at runtime.

| Environment Variable                | Description                                                                  |
|-------------------------------------|------------------------------------------------------------------------------|
| `NAIS_TOKEN_INTROSPECTION_ENDPOINT` | Used to [:dart: secure your application with ID-porten](../how-to/login.md). |

For further details about this endpoint, see the [OpenAPI specification](../../reference/README.md#openapi-specification).

### Variables for manually validating tokens

These variables are optional and should only be used for [manually validating tokens](#manual-token-validation) when :dart: [securing your application with ID-porten](../how-to/login.md).

| Name                      | Description                                                                                                                |
|:--------------------------|:---------------------------------------------------------------------------------------------------------------------------|
| `IDPORTEN_AUDIENCE`       | The expected [audience](../../explanations/README.md#token-validation) for access tokens from ID-porten.                   |
| `IDPORTEN_WELL_KNOWN_URL` | The URL for ID-porten's [OIDC metadata discovery document](../../explanations/README.md#well-known-url-metadata-document). |
| `IDPORTEN_ISSUER`         | `issuer` from the [metadata discovery document](../../explanations/README.md#issuer).                                      |
| `IDPORTEN_JWKS_URI`       | `jwks_uri` from the [metadata discovery document](../../explanations/README.md#jwks-endpoint-public-keys).                 |

`IDPORTEN_WELL_KNOWN_URL` is optional if you're using `IDPORTEN_ISSUER` and `IDPORTEN_JWKS_URI` directly.

## Claims

Notable claims in tokens from ID-porten.
For a complete list of claims, see the [Access Token Reference in ID-porten](https://docs.digdir.no/docs/idporten/oidc/oidc_protocol_access_token#by-value--self-contained-access-token).

`acr`

:   The [security level](#security-levels) used when authenticating the end-user.

`pid`

:   "Personidentifikator". The Norwegian national ID number (fødselsnummer/d-nummer) of the authenticated end user.

## Locales

ID-porten supports a few different locales for the user interface during authentication.

Valid values shown below:

| Value | Description       |
|:------|:------------------|
| `nb`  | Norwegian Bokmål  |
| `nn`  | Norwegian Nynorsk |
| `en`  | English           |
| `se`  | Sámi              |

Set the query parameter `locale` when redirecting the user to login:

```
https://<ingress>/oauth2/login?locale=en
```

## Security levels

ID-porten classifies different user authentication methods into [security levels of assurance](https://docs.digdir.no/docs/idporten/oidc/oidc_protocol_id_token#acr-values).
This is reflected in the `acr` claim for the user's JWTs issued by ID-porten.

Valid values, in increasing order of assurance levels:

| Value                      | Description                                                      | Notes                  |
|:---------------------------|:-----------------------------------------------------------------|:-----------------------|
| `idporten-loa-substantial` | a substantial level of assurance, e.g. MinID                     | Also known as `Level3` |
| `idporten-loa-high`        | a high level of assurance, e.g. BankID, Buypass, Commfides, etc. | Also known as `Level4` |

To configure a default value for _all_ login requests:

```yaml title="app.yaml" hl_lines="6"
spec:
  idporten:
    enabled: true
    sidecar:
      enabled: true
      level: idporten-loa-high
```

The default value is `idporten-loa-high`.

Nais ensures that the user's authentication level matches or exceeds the level configured by the application.
If lower, the user is considered unauthenticated.

For runtime control of the value, set the query parameter `level` when redirecting the user to login:

```
https://<ingress>/oauth2/login?level=idporten-loa-high
```

## Manual token validation

{% include 'auth/partials/validate-manually.md' %}

**Issuer Validation**

Validate that the `iss` claim has a value that is equal to either:

1. the `IDPORTEN_ISSUER` environment variable, or
2. the `issuer` property from the [metadata discovery document](../../explanations/README.md#well-known-url-metadata-document).
   The document is found at the endpoint pointed to by the `IDPORTEN_WELL_KNOWN_URL` environment variable.

**Audience Validation**

Validate that the `aud` claim is equal to the `IDPORTEN_AUDIENCE` environment variable.

**Signature Validation**

Validate that the token is signed with a public key published at the JWKS endpoint.
This endpoint URI can be found in one of two ways:

1. the `IDPORTEN_JWKS_URI` environment variable, or
2. the `jwks_uri` property from the metadata discovery document.
   The document is found at the endpoint pointed to by the `IDPORTEN_WELL_KNOWN_URL` environment variable.

**Claims Validation**

[Other claims](#claims) may be present in the token. Validation of these claims is optional.

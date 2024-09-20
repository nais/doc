---
tags: [tokenx, how-to]
---

# Secure your API with TokenX

This how-to guides you through the steps required to secure your API using [TokenX](../README.md):

## Grant access to consumers

Specify inbound access policies to authorize your consumers:

```yaml title="app.yaml"
spec:
  tokenx:
    enabled: true
  accessPolicy:
    inbound:
      rules:
        - application: app-1  # same namespace and cluster

        - application: app-2  # same cluster
          namespace: team-a

        - application: app-3
          namespace: team-b
          cluster: prod-gcp
```

The above configuration authorizes the following applications:

* application `app-1` running in the same namespace and same cluster as your application
* application `app-2` running in the namespace `team-a` in the same cluster
* application `app-3` running in the namespace `team-b` in the cluster `prod-gcp`

Now that you have granted access to your consumers, they can now exchange tokens for new tokens that target your application.
You will need to validate these tokens in your application.

## Validate tokens

Verify incoming requests from consumers by validating the [JWT Bearer token](../../explanations/README.md#bearer-token) in the `Authorization` header.

{% include 'auth/partials/validate.md' %}

To validate the token, start by validating the [signature and standard time-related claims](../../explanations/README.md#token-validation).

Additionally, perform the following validations:

**Issuer Validation**

Validate that the `iss` claim has a value that is equal to either:

1. the [`TOKEN_X_ISSUER`][variables-ref] environment variable, or
2. the `issuer` property from the [metadata discovery document](../../explanations/README.md#well-known-url-metadata-document).
   The document is found at the endpoint pointed to by the `TOKEN_X_WELL_KNOWN_URL` environment variable.

**Audience Validation**

Validate that the `aud` claim is equal to [`TOKEN_X_CLIENT_ID`][variables-ref].

**Signature Validation**

Validate that the token is signed with a public key published at the JWKS endpoint.
This endpoint URI can be found in one of two ways:

1. the [`TOKEN_X_JWKS_URI`][variables-ref] environment variable, or
2. the `jwks_uri` property from the metadata discovery document.
   The document is found at the endpoint pointed to by the [`TOKEN_X_WELL_KNOWN_URL`][variables-ref] environment variable.

**Other Token Claims**

Other claims may be present in the token.
Validation of these claims is optional.

See the [TokenX claims reference](../reference/README.md#claims) for details.

[variables-ref]: ../reference/README.md#variables-for-validating-tokens

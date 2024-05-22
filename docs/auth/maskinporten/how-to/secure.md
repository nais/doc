---
tags: [maskinporten, how-to]
---

# Secure your API using Maskinporten

This how-to guides you through the steps required to secure your API using [Maskinporten](../README.md):

1. [Define the scopes that you want to expose to other organizations](#define-scopes)
2. [Grant access to scopes for other organizations](#grant-access-to-consumers)
3. [Validate tokens in requests from external consumers](#validate-tokens)

### Prerequisites

- [Expose your application](../../../workloads/application/how-to/expose.md) to consumers at a publicly accessible domain.

### Define scopes

A _scope_ represents a permission that a given consumer has access to.
The semantics and enforcement logic for a scope is your application's responsibility.

Declare all the scopes that you want to expose in your application's NAIS manifest:

```yaml title="nais.yaml" hl_lines="5-11"
spec:
  maskinporten:
    enabled: true
    scopes:
      exposes:
        - name: "some.scope.read"
          enabled: true
          product: "arbeid"
        - name: "some.scope.write"
          enabled: true
          product: "arbeid"
```

See the [scope naming reference](../reference/README.md#scope-naming) for details on naming scopes.

### Grant access to consumers

Grant the external consumer access to the scopes by specifying their organization number:

```yaml title="nais.yaml" hl_lines="8-9"
spec:
  maskinporten:
    enabled: true
    scopes:
      exposes:
        - name: "some.scope.read"
          ...
          consumers:
            - orgno: "123456789"
```

Now that you have configured the scopes in Maskinporten, consumers can now request tokens with these scopes.
You will now need to validate these tokens in your application.

### Validate tokens

Verify incoming requests from the external consumer(s) by validating the [Bearer token](../../explanations/README.md#bearer-token) in the `Authorization` header.

Always validate the [signature and standard time-related claims](../../explanations/README.md#token-validation).
Additionally, perform the following validations:

**Issuer Validation**

Validate that the `iss` claim has a value that is equal to either:

1. the [`MASKINPORTEN_ISSUER`][variables-ref] environment variable, or
2. the `issuer` property from the [metadata discovery document](../../explanations/README.md#well-known-url-metadata-document).
   The document is found at the endpoint pointed to by the `MASKINPORTEN_WELL_KNOWN_URL` environment variable.

**Scope Validation**

Validate that the `scope` claim contains the expected scope(s).
The `scope` claim is a string that contains a whitespace-separated list of scopes.

**Audience Validation**

The `aud` claim is not included by default in Maskinporten tokens and does not need to be validated.
It is only included if the consumer has requested an [audience-restricted token](https://docs.digdir.no/maskinporten_func_audience_restricted_tokens.html).

Only validate the `aud` claim if you want to require your consumers to use audience-restricted tokens.
The expected audience value is up to you to define and must be communicated to your consumers.
The value must be an absolute URI (such as `https://some-provider.no` or `https://some-provider.no/api`).

**Signature Validation**

Validate that the token is signed with a public key published at the JWKS endpoint.
This endpoint URI can be found in one of two ways:

1. the [`MASKINPORTEN_JWKS_URI`][variables-ref] environment variable, or
2. the `jwks_uri` property from the metadata discovery document.
   The document is found at the endpoint pointed to by the [`MASKINPORTEN_WELL_KNOWN_URL`][variables-ref] environment variable.

**Other Token Claims**

Other claims may be present in the token.
Validation of these claims is optional.

See the [Access Token Reference in Maskinporten](https://docs.digdir.no/docs/Maskinporten/maskinporten_protocol_token#the-access-token) for a list of all claims.

[variables-ref]: ../reference/README.md#variables-for-validating-tokens

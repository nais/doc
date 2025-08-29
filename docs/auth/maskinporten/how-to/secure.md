---
tags: [maskinporten, how-to]
conditional: [tenant, nav]
---

# Secure your API with Maskinporten

This how-to guides you through the steps required to secure your API using [Maskinporten](../README.md):

## Prerequisites

- [Expose your application](../../../workloads/application/how-to/expose.md) to consumers at a publicly accessible domain.

## Define scopes

A _scope_ represents a permission that a given consumer has access to.

Declare all the scopes that you want to expose in your application's Nais manifest:

```yaml title="nais.yaml" hl_lines="5-15"
spec:
  maskinporten:
    enabled: true
    scopes:
      exposes:
        # nav:helse/sykepenger/afp.write
        - enabled: true
          product: "helse"
          separator: "/"
          name: "sykepenger/afp.write"
        # nav:helse/sykepenger/afp.read
        - enabled: true
          product: "helse"
          separator: "/"
          name: "sykepenger/afp.read"
```

See the [fully qualified scope reference](../reference/README.md#fully-qualified-scopes) for details on naming scopes.

See the [Nais application reference](../../../workloads/application/reference/application-spec.md#maskinportenscopesexposes) for the complete specifications with all possible options.

## Grant access to consumers

Grant the external consumer access to the scopes by specifying their organization number:

```yaml title="nais.yaml" hl_lines="10-11"
spec:
  maskinporten:
    enabled: true
    scopes:
      exposes:
        - name: "sykepenger/afp.read"
          enabled: true
          product: "helse"
          separator: "/"
          consumers:
            - orgno: "123456789"
```

Now that you have configured the scopes in Maskinporten, consumers can request tokens with these scopes.
You will need to validate these tokens in your application.

## Validate tokens

Verify incoming requests from consumers by validating the [JWT Bearer token](../../explanations/README.md#bearer-token) in the `Authorization` header.

{% set identity_provider = 'maskinporten' %}
{% set claims_reference = '../reference/README.md#claims' %}
{% set token_validation_reference = '../reference/README.md#manual-token-validation' %}
{% include 'auth/partials/validate.md' %}

### Validate scopes

Your application must validate the `scope` claim in the token.

The `scope` claim is a string that contains a whitespace-separated list of scopes, for example:

```json
{
    "scope": "nav:helse/sykepenger/afp.read nav:helse/sykepenger/afp.write"
}
```

Validate that the `scope` claim contains the expected scope(s).

The semantics and authorization that a scope represents is up to you to define and enforce in your application code.

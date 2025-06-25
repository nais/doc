---
tags: [maskinporten, reference]
conditional: [tenant, nav]
---

# Maskinporten reference

## Claims

See the [Access Token reference in Maskinporten](https://docs.digdir.no/docs/Maskinporten/maskinporten_protocol_token#the-access-token) for a list of all claims.

## Manual token validation

{% include 'auth/partials/validate-manually.md' %}

**Issuer Validation**

Validate that the `iss` claim has a value that is equal to either:

1. the `MASKINPORTEN_ISSUER` environment variable, or
2. the `issuer` property from the [metadata discovery document](../../explanations/README.md#well-known-url-metadata-document).
   The document is found at the endpoint pointed to by the `MASKINPORTEN_WELL_KNOWN_URL` environment variable.

**Audience Validation**

The `aud` claim is not included by default in Maskinporten tokens and does not need to be validated.
It is only included if the consumer has requested an [audience-restricted token](https://docs.digdir.no/maskinporten_func_audience_restricted_tokens.html).

Only validate the `aud` claim if you want to require your consumers to use audience-restricted tokens.
The expected audience value is up to you to define and must be communicated to your consumers.
The value must be an absolute URI (such as `https://some-provider.no` or `https://some-provider.no/api`).

**Signature Validation**

Validate that the token is signed with a public key published at the JWKS endpoint.
This endpoint URI can be found in one of two ways:

1. the `MASKINPORTEN_JWKS_URI` environment variable, or
2. the `jwks_uri` property from the metadata discovery document.
   The document is found at the endpoint pointed to by the `MASKINPORTEN_WELL_KNOWN_URL` environment variable.

**Scope Validation**

Your application must validate the `scope` claim in the token.

The `scope` claim is a string that contains a whitespace-separated list of scopes, for example:

```json
{
    "scope": "nav:helse/sykepenger/afp.read nav:helse/sykepenger/afp.write"
}
```

Validate that the `scope` claim contains the expected scope(s).

The semantics and authorization that a scope represents is up to you to define and enforce in your application code.

**Other Token Claims**

[Other claims](#claims) may be present in the token.
Validation of these claims is optional.

## Runtime Variables & Credentials

Your application will automatically be injected with environment variables at runtime.

| Environment Variable                | Description                                                                       |
|-------------------------------------|-----------------------------------------------------------------------------------|
| `NAIS_TOKEN_ENDPOINT`               | Used to [:dart: consume an external API with Maskinporten](../how-to/consume.md). |
| `NAIS_TOKEN_INTROSPECTION_ENDPOINT` | Used to [:dart: secure your application with Maskinporten](../how-to/secure.md).  |

For further details about these endpoints, see the [OpenAPI specification](../../reference/README.md#openapi-specification).

## Scope Naming

A Maskinporten scope consists of a _prefix_ and a _subscope_:

```text
scope := <prefix>:<subscope>
```

{%- if tenant() == "nav" %}
### Prefix

The _prefix_ is set to `nav` for all scopes.
{%- endif %}

### Subscope

A _subscope_ should describe the resource to be exposed as accurately as possible.
It consists of three parts; _product_, _separator_ and _name_:

```text
subscope := <product><separator><name>
```

_product_

:   The [`product`](../../../workloads/application/reference/application-spec.md#maskinportenscopesexposesproduct) is a logical grouping of resources, such as `arbeid`, `helse`, or `pensjon`.

_separator_

:   The [`separator`](../../../workloads/application/reference/application-spec.md#maskinportenscopesexposesseparator) should be set to `/`.

_name_

:   The [`name`](../../../workloads/application/reference/application-spec.md#maskinportenscopesexposesname) describes the resource itself.
    It may contain multiple parts separated by `/`.

    The name may also contain a suffix to separate between access levels.
    For instance, you could separate between `write` access:

    ```text
    name := sykepenger/afp.write
    ```

    ...and `read` access:

    ```text
    name := sykepenger/afp.read
    ```

### Example

For the following scope definition:

```yaml title="nais.yaml" hl_lines="5-11"
spec:
  maskinporten:
    enabled: true
    scopes:
      exposes:
        # nav:helse/sykepenger/afp.read
        - enabled: true
          product: "helse"
          separator: "/"
          name: "sykepenger/afp.read"
```

the subscope is then:

```text
subscope := helse/sykepenger/afp.read
```

which results in the fully qualified scope:

```text
scope := nav:helse/sykepenger/afp.read
```

## Spec

See the [:books: Nais application reference](../../../workloads/application/reference/application-spec.md#maskinporten).

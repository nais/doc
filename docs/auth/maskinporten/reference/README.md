---
tags: [maskinporten, reference]
conditional: [tenant, nav]
---

# Maskinporten reference

## Claims

See the [Access Token reference in Maskinporten](https://docs.digdir.no/docs/Maskinporten/maskinporten_protocol_token#the-access-token) for a list of all claims.

## Runtime Variables & Credentials

Your application will automatically be injected with environment variables at runtime.

### Variables for acquiring tokens

These variables are used to [:dart: consume an external API](../how-to/consume.md).

| Name                          | Description                                                                                                             |
|:------------------------------|:------------------------------------------------------------------------------------------------------------------------|
| `MASKINPORTEN_CLIENT_ID`      | [Client ID](../../explanations/README.md#client-id) that uniquely identifies the client in Maskinporten.                |
| `MASKINPORTEN_CLIENT_JWK`     | [Private JWK](../../explanations/README.md#private-keys) (RSA) for the client.                                          |
| `MASKINPORTEN_WELL_KNOWN_URL` | The well-known URL for the [metadata discovery document](../../explanations/README.md#well-known-url-metadata-document) |
| `MASKINPORTEN_ISSUER`         | `issuer` from the [metadata discovery document](../../explanations/README.md#issuer).                                   |
| `MASKINPORTEN_TOKEN_ENDPOINT` | `token_endpoint` from the [metadata discovery document](../../explanations/README.md#token-endpoint).                   |

### Variables for validating tokens

These variables are used to [:dart: secure your API](../how-to/secure.md).

| Name                          | Description                                                                                                             |
|:------------------------------|:------------------------------------------------------------------------------------------------------------------------|
| `MASKINPORTEN_WELL_KNOWN_URL` | The well-known URL for the [metadata discovery document](../../explanations/README.md#well-known-url-metadata-document) |
| `MASKINPORTEN_ISSUER`         | `issuer` from the [metadata discovery document](../../explanations/README.md#issuer).                                   |
| `MASKINPORTEN_JWKS_URI`       | `jwks_uri` from the [metadata discovery document](../../explanations/README.md#jwks-endpoint-public-keys).              |

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

See the [:books: NAIS application reference](../../../workloads/application/reference/application-spec.md#maskinporten).

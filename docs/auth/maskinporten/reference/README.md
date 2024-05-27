---
tags: [maskinporten, reference]
---

# Maskinporten Reference

## Runtime Variables & Credentials

Your application will automatically be injected with environment variables at runtime.

### Variables for acquiring tokens

These variables are used to [:dart: consume an external API](../how-to/consume.md).

| Name                          | Description                                                                                                             |
|:------------------------------|:------------------------------------------------------------------------------------------------------------------------|
| `MASKINPORTEN_CLIENT_ID`      | [Client ID](../../explanations/README.md#client-id) that uniquely identifies the client in Maskinporten.                |
| `MASKINPORTEN_CLIENT_JWK`     | [Private JWK](../../explanations/README.md#private-keys) (RSA) for the client.                                          |
| `MASKINPORTEN_SCOPES`         | Whitespace-separated string of scopes registered for the client.                                                        |
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

All scopes within Maskinporten consist of a _prefix_ and a _subscope_:

```text
scope := <prefix>:<subscope>
```

For example:

```text
scope := nav:trygdeopplysninger
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

**Product**

A product should be a _logical grouping_ of the resource, such as `trygdeopplysninger` or `pensjon`.

**Separator**

The default separator is `:`. If `name` contains `/`, the default separator is instead `/`.

If the [`separator` field](../../../workloads/application/reference/application-spec.md#maskinportenscopesexposesseparator) is configured, it will override the default separator.

**Name**

The _name_ may also be _postfixed_ to separate between access levels.
For instance, you could separate between `write` access:

```text
name := trygdeopplysninger.write
```

...and `read` access:

```text
name := trygdeopplysninger.read
```

### Example scope

=== "Without forward slash"

    If **name** does not contain any `/` (forward slash), the **separator** is set to `:` (colon).

    For the following scope:

    ```yaml title="nais.yaml" hl_lines="5-11"
    spec:
      maskinporten:
        enabled: true
        scopes:
          exposes:
            - name: "some.scope.read"
              enabled: true
              product: "arbeid"
    ```

    - **product** is set to `arbeid`
    - **name** is set to `some.scope.read`

    The subscope is then:

    ```text
    subscope := arbeid:some.scope.read
    ```

    which results in the fully qualified scope:

    ```text
    scope := nav:arbeid:some.scope.read
    ```

=== "With forward slash"

    If **name** contains a `/` (forward slash), the **separator** is set to `/` (forward slash).

    For the following scope:

    ```yaml title="nais.yaml" hl_lines="5-11"
    spec:
      maskinporten:
        enabled: true
        scopes:
          exposes:
            - name: "some/scope.read"
              enabled: true
              product: "arbeid"
    ```

    - **product** is set to `arbeid`
    - **name** is set to `some/scope.read`

    The subscope is then:

    ```text
    subscope := arbeid/some/scope.read
    ```
  
    which results in the fully qualified scope:

    ```text
    scope := nav:arbeid/some/scope.read
    ```

## Spec

See the [:books: NAIS application reference](../../../workloads/application/reference/application-spec.md#maskinporten).

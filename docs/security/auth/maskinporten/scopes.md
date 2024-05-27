---
tags: [maskinporten]
---

# Maskinporten Scopes

A _scope_ represents a permission that a given consumer has access to.
In Maskinporten, you can define scopes and grant other organizations access to these scopes. 

As an API provider, you are fully responsible for defining the granularity of access and authorization associated with a given scope.

An external consumer that has been granted access to your scopes may then acquire an `access_token` using a Maskinporten client that belongs to their organization.
[Clients registered via NAIS](client.md) belong to NAV and may only be used by NAV.

## Spec

Example configuration:

```yaml title="nais.yaml"
spec:
  maskinporten:
    enabled: true
    scopes:
      exposes:
        - name: "some.scope.read"
          enabled: true
          product: "arbeid"
          consumers:
            - orgno: "123456789"
```

See the [NAIS manifest](../../../workloads/application/reference/application-spec.md#maskinporten) for the complete specification.

## Network Connectivity

Maskinporten is an external service.
The platform automatically configures outbound access to the Maskinporten hosts.

You do _not_ have to explicitly configure outbound access to Maskinporten yourselves in GCP.

## Runtime Variables & Credentials

Your application will automatically be injected with both environment variables and files at runtime.
You can use whichever is most convenient for your application.

The files are available at the following path: `/var/run/secrets/nais.io/maskinporten/`

| Name                          | Description                                                                                                   |
|:------------------------------|:--------------------------------------------------------------------------------------------------------------|
| `MASKINPORTEN_WELL_KNOWN_URL` | The well-known URL for the [metadata discovery document](../../../auth/explanations/README.md#well-known-url-metadata-document)     |
| `MASKINPORTEN_ISSUER`         | `issuer` from the [metadata discovery document](../../../auth/explanations/README.md#issuer).                                       |
| `MASKINPORTEN_JWKS_URI`       | `jwks_uri` from the [metadata discovery document](../../../auth/explanations/README.md#jwks-endpoint-public-keys).                  |

These variables are used when validating tokens issued by Maskinporten.

## Getting Started

As an API provider, you will need to do three things:

1. Define the scopes that you want to expose to other organizations
2. Expose your application to the external consumers
3. Validate tokens in requests from external consumers

### 1. Define Scopes

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

### 2. Expose Application

Expose your application to the consumer(s) at a publicly accessible ingress.

### 3. Validate Tokens

Verify incoming requests from the external consumer(s) by validating the [Bearer token](../../../auth/explanations/README.md#bearer-token) in the `Authorization` header.

Always validate the [signature and standard time-related claims](../../../auth/explanations/README.md#token-validation).
Additionally, perform the following validations:

**Issuer Validation**

Validate that the `iss` claim has a value that is equal to either:

1. the `MASKINPORTEN_ISSUER` [environment variable](#runtime-variables-credentials), or
2. the `issuer` property from the [metadata discovery document](../../../auth/explanations/README.md#well-known-url-metadata-document).
   The document is found at the endpoint pointed to by the `MASKINPORTEN_WELL_KNOWN_URL` environment variable.

**Scope Validation**

Validate that the `scope` claim contains the expected scope(s).
The `scope` claim is a string that contains a whitespace-separated list of scopes.

Continuing from the previous examples, you would validate that the `scope` claim contains at least one of:

- `nav:arbeid:some.scope.read` or
- `nav:arbeid:some.scope.write`

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

## Other Token Claims

Other claims may be present in the token.
Validation of these claims is optional.

See the [Access Token Reference in Maskinporten](https://docs.digdir.no/docs/Maskinporten/maskinporten_protocol_token#the-access-token) for a list of all claims.

## Scope Naming

All scopes within Maskinporten consist of a **prefix** and a **subscope**:

```text
scope := <prefix>:<subscope>
```

For example:

```text
scope := nav:trygdeopplysninger
```

The **prefix** for all scopes provisioned through NAIS will always be `nav`.

A **subscope** should describe the resource to be exposed as accurately as possible.
It consists of three parts; **product**, **separator** and **name**:

```text
subscope := <product><separator><name>
```

The **name** may also be _postfixed_ to separate between access levels.
For instance, you could separate between `write` access:

```text
name := trygdeopplysninger.write
```

...and `read` access:

```text
name := trygdeopplysninger.read
```

Absence of a postfix should generally be treated as strictly `read` access.

=== "Example scope"

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

    which results in the scope:

    ```text
    scope := nav:arbeid:some.scope.read
    ```

=== "Example scope with forward slash"
    
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
  
    which results in the scope:

    ```text
    scope := nav:arbeid/some/scope.read
    ```

## Delegation of scopes

[Delegation of scopes](https://docs.digdir.no/docs/Maskinporten/maskinporten_func_delegering) is not supported.

If you need a scope with delegation, please see [IaC repository](https://github.com/navikt/nav-maskinporten).

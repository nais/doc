# Scopes

A _scope_ in Maskinporten terminology is equivalent to a distinct API. As an API provider, you will:

- define scopes to be registered in Maskinporten
- grant access to other organizations for your defined scopes
  
The notion of scope is loosely defined to allow semantic freedom in terms of API providers' own definition and granularity of access and authorization.

An external consumer that has been granted access to your scopes may then acquire an `access_token` with their own Maskinporten client, which they will need to acquire from DigDir on their own. 
[Our NAIS clients](client.md) are registered as part of the NAV organization and may only be used by NAV.

## Spec

See the [NAIS manifest](../../../nais-application/application.md#maskinporten).

## Configuration

=== "nais.yaml"
  ```yaml
  spec:
    maskinporten:
      enabled: true
      scopes:
        exposes:
          - name: "some.scope.read"
            enabled: true
            product: "arbeid"
            allowedIntegrations:
              - maskinporten
            atMaxAge: 120
            consumers:
              - orgno: "123456789"

    # required for on-premises only
    webproxy: true
  ```

## Scope Naming Format

All scopes within Maskinporten are defined using the following syntax:

```text
scope := <prefix>:<subscope>
```

???+ example "Example scope"
    ```text
    scope := nav:trygdeopplysninger
    ```
### Prefix

The _prefix_ for all scopes provisioned through NAIS will **always** be `nav`.

### Subscope

A _subscope_ should describe the resource to be exposed as accurately as possible (e.g. `trygdeopplysninger` or `helseopplysninger`).

The subscope may also be _postfixed_ to separate between access levels, for instance `read` and/or `write` access (e.g. `nav:trygdeopplysninger.write`). 

Absence of a postfix should generally be treated as strictly `read` access.
  
All _subscopes_ for NAIS clients will have the following form:

```text
subscope := <product><separator><name>
```

where `separator` is:

- `/` if and only if `name` contains `/`.
- `:` otherwise.

???+ example "Subscope example"
    For the [example configuration](#configuration) above where
    
    - `product := arbeid`
    - `name := some.scope.read`

    the subscope will be the following:

    ```text
    subscope := arbeid:some.scope.read
    ```
  
    which results in the scope:

    ```text
    scope := nav:arbeid:some.scope.read
    ```

???+ example "Subscope example with different separator"
    If the `name` instead contains the `/` character, e.g:
    
    - `name := some/scope.read`

    and the product is the same as before:
    
    - `product := arbeid`

    the resulting subscope will be:

    ```text
    subscope := arbeid/some/scope.read
    ```
  
    which results in the scope:

    ```text
    scope := nav:arbeid/some/scope.read
    ```

## Audience Restrictions

If there are multiple APIs that are protected by the same _scope_, one might be susceptible to replay attacks.

One way to mitigate this is to require that tokens contain an `aud` claim with a unique value for each unique API. 
The API should reject requests with tokens that do not have this claim and expected value. 
This ensures that an `access_token` may only be used for a specific API.

The value of this must be defined by the API provider out-of-band from Maskinporten. 
It is thus the API provider's responsibility to inform any consumers of this expected value so that they can modify their requests accordingly.

See DigDir's documentation on [audience-restricted tokens](https://docs.digdir.no/maskinporten_func_audience_restricted_tokens.html) for more information.

## Legacy

!!! info
    This section only applies if you have an existing scope registered at the [IaC repository](https://github.com/navikt/nav-maskinporten) 
    or use the scope in on-prem clusters today.

### Application do not use the IaC repo and is migrating from on-prem to gcp

The scope is assigned your application in your current cluster;

```text
<cluster>:<metadata.namespace>:<metadata.name>.<subscope>
```

so when migrating from on-prem nais to gcp, the scope belongs to that cluster. If you already migrated your app, there
is no reason to panic, scope still exists and works as before, but you are not able to make changes eg. add/remove
consumers until cluster is updated. Right now the cluster need to be changed manually so please take contact in channel
\#nais.

### Migration guide to keep existing Maskinporten scope (IaC -> nais.yml) (NAIS application only)

The following describes the steps needed to migrate a scope registered in [IaC repository](https://github.com/navikt/nav-maskinporten/scopes).

#### Step 1 - Update your scope description in the IaC repository

- Ensure the **`description`** of the scope registered in the `IaC` repository follows the naming scheme:

```text
<cluster>:<metadata.namespace>:<metadata.name>.<subscope>
```

!!! info
    meatdata.namespace is your running applications namespace
    meatdata.name is your running applications name
    clutser, metadata.namespace and metadata.name containing `-` should be replaced with ``

#### Step 4 - Let IaC repository provisioning the scope client to Digdir.

- Wait for IaC repo actions to finish. [maskinporten IaC actions](https://github.com/navikt/nav-maskinporten/actions)

#### Step 5 - Deploy your NAIS application with Maskinporten provisioning enabled.

- Ensure exposed scopes enabled and name matches the already exposed `subscope`

- See [configuration](#configuration).

#### Step 6 - Delete your scope from the IaC repository

- Verify that everything works after the migration
- Delete the scope from the [IaC repository](https://github.com/navikt/nav-maskinporten/scopes) in order to maintain a single source of truth.

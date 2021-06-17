---
description: >
  Enabling service-to-service authentication with external agencies using Maskinporten.
---

# Maskinporten Client

!!! warning "Status: Opt-In Open Beta"
    This feature is only available in [team namespaces](../../clusters/team-namespaces.md)

## Abstract

!!! abstract
    [Maskinporten](https://docs.digdir.no/maskinporten_auth_server-to-server-oauth2.html) is a service provided by DigDir that allows API providers - in this case, external agencies - to securely enforce server-to-server authorization of their exposed APIs using OAuth 2.0 JWT grants, inspired by [Google's System Accounts](https://developers.google.com/identity/protocols/oauth2/service-account).
 
    With Maskinporten, API providers may model access policies by using scopes based on the organization number of the consumer.

    The NAIS platform provides support for simple declarative provisioning of a Maskinporten client that your application may use to integrate with Maskinporten, and in turn consume services and APIs served by external agencies.

    The client allows your application to leverage Maskinporten for authentication and authorization when performing service-to-service requests to external agencies. To achieve this, your application must implement [JWT grants](https://docs.digdir.no/maskinporten_protocol_token.html).

## Getting Started

### Access Policies

Maskinporten is a third-party service outside of our clusters, which is not reachable by default like most third-party services.

#### Google Cloud Platform \(GCP\)

The following [outbound external hosts](../../nais-application/access-policy.md#external-services) are automatically added when enabling this feature:

- `ver2.maskinporten.no` in development
- `maskinporten.no` in production

You do not need to specify these explicitly.

#### On-premises

You must enable and use [`webproxy`](../../nais-application/application.md#webproxy) for external communication.

## Consume Scopes

Maskinporten allows API providers to define access to their APIs, modeled as scopes and based on the consumer's organization number.

When a client requests a token from Maskinporten:

- Maskinporten validates the validity of the JWT and its signature ([Runtime JWK Secret](#runtime-variables-and-credentials) used to sign the JWT).
- When client has access to the requested list of `scopes`, an `access_token` will be returned to the client and which can be used for authentication to the intended external service.

!!! danger
    Make sure that the relevant service providers have pre-registered **NAV** as a valid consumer of any scopes that you define. Provisioning of client will fail otherwise.
    NAV´s `pre-registered` scopes can be found with proper access rights in [Digdir selvbetjening](https://selvbetjening-samarbeid-ver2.difi.no/auth/login).

### Consumes Configuration

=== "nais.yaml"
    ```yaml
    spec:
      maskinporten:
        enabled: true
        scopes:
          consumes:
            - name: "skatt:some.scope"
            - name: "nav:some/other/scope"

    # required for on-premises only
    webproxy: true
    ```

### Spec

See the [NAIS manifest](../../nais-application/application.md#maskinporten).

## Usage

### Runtime Variables and Credentials

The following environment variables and files (under the directory `/var/run/secrets/nais.io/maskinporten`) are available at runtime:

---

#### `MASKINPORTEN_CLIENT_ID`

???+ note

    Maskinporten client ID. Unique ID for the application in Maskinporten.

    Example value: `e89006c5-7193-4ca3-8e26-d0990d9d981f`

---

#### `MASKINPORTEN_SCOPES`

???+ note

    The scopes registered for the client at Maskinporten as a whitepace-separated string. See [JWT grants](https://docs.digdir.no/maskinporten_protocol_token.html) for more information.

    Example value: `nav:first/scope nav:another/scope`

---

#### `MASKINPORTEN_WELL_KNOWN_URL`

???+ note

    The well-known URL for the OIDC metadata discovery document for Maskinporten. 

    Example value: `https://ver2.maskinporten.no/.well-known/oauth-authorization-server`

---

#### `MASKINPORTEN_CLIENT_JWK`

???+ note

    Private JWK containing the private RSA key for creating signed JWTs when using the [JWT grants](https://docs.digdir.no/maskinporten_protocol_token.html).

    ```javascript
    {
    "use": "sig",
    "kty": "RSA",
    "kid": "jXDxKRE6a4jogcc4HgkDq3uVgQ0",
    "alg": "RS256",
    "n": "xQ3chFsz...",
    "e": "AQAB",
    "d": "C0BVXQFQ...",
    "p": "9TGEF_Vk...",
    "q": "zb0yTkgqO...",
    "dp": "7YcKcCtJ...",
    "dq": "sXxLHp9A...",
    "qi": "QCW5VQjO..."
    }
    ```

### API Consumer

Refer to the [documentation at DigDir](https://docs.digdir.no/maskinporten_guide_apikonsument.html).

You may skip any step involving client registration as this is automatically handled when [enabling this feature](#consumes-configuration).

## Legacy

!!! info
    This section only applies if you have an existing client registered at the [IaC repository](https://github.com/navikt/nav-maskinporten)  

### Migration guide to keep existing Maskinporten client (NAIS application only)

The following describes the steps needed to migrate a client registered in [IaC repository](https://github.com/navikt/nav-maskinporten).

#### Step 1 - Update your client description in the IaC repository

- Ensure the **`description`** of the client registered in the `IaC` repository follows the naming scheme:

```text
<cluster>:<metadata.namespace>:<metadata.name>
```

#### Step 3 - Deploy your NAIS application with Maskinporten provisioning enabled

- See [configuration](#consumes-configuration).

#### Step 4 - Delete your application from the IaC repository

- Verify that everything works after the migration
- Delete the application from the [IaC repository](https://github.com/navikt/nav-maskinporten) in order to maintain a single source of truth.

## Expose Scopes

### Why expose your api?

Maskinporten simplifies data sharing between machines and companies and NAV does not have to spend resources on developing and maintaining its own security mechanisms.
By exposing your scope and secure your API with Maskinporten, NAV as a public company can be sure to communicate and share data with private and public companies supposed to have access.

The role to Maskinporten is to be a trust anchor - a security mechanism for secure sharing of data that ensures that data only flows where it should.
When the data exchange is to take place between machines, maskinporten ensures the identity of the consumer.

NAIS applications can define secure access to their APIs, modeled and exposed as scopes, based on the API consumers' organization numbers.

#### Exposes Configuration

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

In the Maskinporten context, an API is the same as an Oauth2 scope. NAV as API provider has a prefix manually assigned.

```text
prefix := nav:
```

Applications in NAV has the freedom to decide semantics for their `name` (subscope) to apply API security within the framework of the Oauth2 standards.
An exposed scope will be categorized by `product`, in this case your product-area. Scopes registered for NAV as API provider must be unique in the context of `product` or provisioning of scope will fail.

```text
subscope := <product><./:><name>
```

If `name` is separated by `.` or `:`:

```text
subscope := arbeid:some.scope.read
```

If `name` is separated by `/`:

```text
subscope := arbeid/some.scope.read
```

!!! info "regex match of subscope"
    Be sure to match subscope `<product><./:><name>` to regex: `^([a-zæøå0-9]+\/?)+(\:[a-zæøå0-9]+)*[a-zæøå0-9]+(\.[a-zæøå0-9]+)*$`.

The registered scope at Maskinporten will have this form:

```text
scope := nav:<product><./:><name>
```

```text
scope := nav:arbeid:some.scope.read
```

or

```text
scope := nav:arbeid/some.scope.read
```

##### Allowed integration types

Default `maskinporten`.

If set, this restricts consumers of your scope to only use "maskinporten" client.

Supports several of values, other values can be `idporten` and `krr`.

##### At Max Age

Default `30`.

Allows you to specify a maximum lifetime in `seconds` for issued access_token.

### Audience

For more information on how to [audience-restrict](https://docs.digdir.no/maskinporten_func_audience_restricted_tokens.html?h=resource) an application scope.

### Migration guide to keep existing Maskinporten Scope (NAIS application only)

The following describes the steps needed to migrate a scope registered in [IaC repository](https://github.com/navikt/nav-maskinporten/scopes).

#### Step 1 - Update your scope description in the IaC repository

- Ensure the **`description`** of the scope registered in the `IaC` repository follows the naming scheme:

```text
<cluster>:<metadata.namespace>:<metadata.name>.<subscope>
```

#### Step 3 - Deploy your NAIS application with Maskinporten provisioning enabled.

- Ensure exposed scopes enabled and name matches the already exposed `subscope`

- See [configuration](#exposes-configuration).

#### Step 4 - Delete your scope from the IaC repository

- Verify that everything works after the migration
- Delete the scope from the [IaC repository](https://github.com/navikt/nav-maskinporten/scopes) in order to maintain a single source of truth.

## Permanently deleting a client

!!! warning
    Permanent deletes are irreversible. Only do this if you are certain that you wish to completely remove the client from DigDir 
    and deactivates exposed scopes and granted access for consumers wil be removed.

    When an `MaskinportenClient` resource gets deleted from a Kubernetes cluster, the client will not be deleted from DigDir.

!!! info
    The `Application` resource owns the `MaskinportenClient` resource, deletion of the former will thus trigger a deletion of the latter.

    If the `MaskinportenClient` resource is recreated, the client will thus retain the same client ID.

If you want to completely delete the client from DigDir, you must add the following annotation to the `MaskinportenClient` resource:

```bash
kubectl annotate maskinportenclient <app> digdir.nais.io/delete=true
```

When this annotation is in place, deleting the `MaskinportenClient` resource from Kubernetes will trigger removal of the client and inactivating of registered scopes from DigDir.

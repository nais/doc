---
description: >
  Enabling service-to-service authentication with external agencies using Maskinporten.
---

# Maskinporten Client

!!! warning "Status: Opt-In Open Beta"
    This feature is only available in the [Google Cloud Platform (GCP)](../../clusters/gcp.md) clusters.

## Abstract

[Maskinporten](https://difi.github.io/felleslosninger/maskinporten_auth_server-to-server-oauth2.html) allows API providers (external agencies) to define access to their APIs, modeled as scopes and based on the organization number.

Maskinporten is a service that offers a simple API security model based on the OAuth2 protocol, and the use of JWT bearer grants. A Concept inspired by [Google's System Accounts](https://developers.google.com/identity/protocols/oauth2/service-account).

The NAIS platform provides support for simple declarative provisioning of an Maskinporten client that your application may use to integrate with Maskinporten.

An Maskinporten client allows your application to leverage Maskinporten for authentication and authorization when performing service-to-service requests to external agencies. To achieve this, your application must implement [JWT grants](https://difi.github.io/felleslosninger/maskinporten_protocol_token.html).

## Configuration

### Getting Started

=== "Minimal nais.yaml example"
    ```yaml
    apiVersion: "nais.io/v1alpha1"
    kind: "Application"
    metadata:
       name: nais-testapp
       namespace: aura
       labels:
           team: aura
    spec:
      image: navikt/nais-testapp:66.0.0
      maskinporten:
        enabled: true
        scopes:
          - scope: "nav:some/scope"
    ```

### Spec

See the [NAIS manifest](../../nais-application/nais.yaml/reference.md#specmaskinporten).

### Access Policies

The following [outbound external hosts](../../nais-application/access-policy.md#external-services) are automatically added when enabling this feature:

- `ver2.maskinporten.no` in development
- `maskinporten.no` in production

You do not need to specify these explicitly.

### Scopes

Maskinporten allows API providers to define access to their APIs, modeled as scopes and based on the consumer's organization number.

When a `client` requests Maskinporten (Identity Provider) for a token:
- Maskinporten validates the validity of the JWT and signature ([Runtime JWK Secret](#runtime-variables-and-credentials) used to sign the JWT).  
- When `client` has access to the requested resources: `scope`, an `access_token` will be returned to the `client` and can be used for further actions.

!!! danger
    Make sure that the relevant service providers have pre-registered **NAV** as a valid consumer of any scopes that you define. Provisioning of client will fail otherwise.
    NAV´s `pre-registered` scopes can be found with proper access rights in [Digdir selvbetjening](https://selvbetjening-samarbeid-ver2.difi.no/auth/login).

### Runtime Variables and Credentials

The following environment variables and files (under the directory `/var/run/secrets/nais.io/maskinporten`) are available at runtime:

===" Description"
    | Name | Description |
    |---|---|
    | `MASKINPORTEN_CLIENT_ID` | Maskinporten client ID. Unique ID for the application in Maskinporten |
    | `MASKINPORTEN_CLIENT_JWK` | Private JWK containing the private RSA key for creating signed JWTs when using the [JWT grants](https://difi.github.io/felleslosninger/maskinporten_protocol_token.html). |
    | `MASKINPORTEN_SCOPES` |  The scopes registered for the client at Maskinporten as a whitepace-separated string. See [JWT grants](https://difi.github.io/felleslosninger/maskinporten_protocol_token.html) for more information. |
    | `MASKINPORTEN_WELL_KNOWN_URL` | The well-known URL for the OIDC metadata discovery document for Maskinporten. |
=== "Example values"
    | Name | Values |
    |---|---|
    | `MASKINPORTEN_CLIENT_ID` | `e89006c5-7193-4ca3-8e26-d0990d9d981f` |
    | `MASKINPORTEN_SCOPES` | `nav:first/scope nav:another/scope` |
    | `MASKINPORTEN_WELL_KNOWN_URL` | `https://ver2.maskinporten.no/.well-known/oauth-authorization-server` |
=== "Example value for MASKINPORTEN_CLIENT_JWK"
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

### Migration guide to keep existing Maskinporten client (NAIS application only)

Migrating from [IaC repository](https://github.com/navikt/nav-maskinporten) to [Digdirator](https://github.com/nais/digdirator) ensures that your application for very deploy will trigger rotation of JWK(s). Keeping all used and invalidating non used. 

The following describes the steps needed to migrate a client registered in [IaC repository](https://github.com/navikt/nav-maskinporten).

#### Step 1 - Update your client description in the IaC repository

- Ensure the **`description`** of the client registered in the `IaC` repository follows a naming scheme:

```text
<cluster>:<metadata.namespace>:<metadata.name>
```

#### Step 3 - Deploy your NAIS application with Maskinporten provisioning enabled

- See [getting started](#getting-started).

#### Step 4 - Delete your application from the IaC repository

- Verify that everything works after the migration
- Delete the application from the [IaC repository](https://github.com/navikt/nav-maskinporten) in order to maintain a single source of truth.

## Internals

See: [ID-porten internals](idporten.md#internals)

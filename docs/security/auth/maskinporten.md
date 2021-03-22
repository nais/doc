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

## Configuration

### Getting Started

=== "nais.yaml"
    ```yaml
    spec:
      maskinporten:
        enabled: true
        scopes:
          - name: "nav:some/scope"
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

When a client requests a token from Maskinporten:

- Maskinporten validates the validity of the JWT and its signature ([Runtime JWK Secret](#runtime-variables-and-credentials) used to sign the JWT).
- When client has access to the requested list of `scopes`, an `access_token` will be returned to the client and which can be used for authentication to the intended external service.

!!! danger
    Make sure that the relevant service providers have pre-registered **NAV** as a valid consumer of any scopes that you define. Provisioning of client will fail otherwise.
    NAV´s `pre-registered` scopes can be found with proper access rights in [Digdir selvbetjening](https://selvbetjening-samarbeid-ver2.difi.no/auth/login).

## Usage

### Runtime Variables and Credentials

The following environment variables and files (under the directory `/var/run/secrets/nais.io/maskinporten`) are available at runtime:

???+ example "`MASKINPORTEN_CLIENT_ID`"

    Maskinporten client ID. Unique ID for the application in Maskinporten.

    Example value: `e89006c5-7193-4ca3-8e26-d0990d9d981f`

???+ example "`MASKINPORTEN_SCOPES`"

    The scopes registered for the client at Maskinporten as a whitepace-separated string. See [JWT grants](https://docs.digdir.no/maskinporten_protocol_token.html) for more information.

    Example value: `nav:first/scope nav:another/scope`

???+ example "`MASKINPORTEN_WELL_KNOWN_URL`"

    The well-known URL for the OIDC metadata discovery document for Maskinporten. 

    Example value: `https://ver2.maskinporten.no/.well-known/oauth-authorization-server`

???+ example "`MASKINPORTEN_CLIENT_JWK`"

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

### Consume an API

Refer to the [documentation at DigDir](https://docs.digdir.no/maskinporten_guide_apikonsument.html).

You may skip any step involving client registration as this is automatically handled when [enabling this feature](#getting-started).

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

- See [getting started](#getting-started).

#### Step 4 - Delete your application from the IaC repository

- Verify that everything works after the migration
- Delete the application from the [IaC repository](https://github.com/navikt/nav-maskinporten) in order to maintain a single source of truth.

## Internals

See [ID-porten internals](idporten.md#internals).

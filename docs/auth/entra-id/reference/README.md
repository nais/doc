---
tags: [entra-id, azure-ad, reference]
conditional: [tenant, nav]
---

# Entra ID reference

## Access policies

### Applications

{% include 'auth/entra-id/partials/app-access.md' %}

### Users

{% include 'auth/entra-id/partials/user-access.md' %}

### Fine-grained permissions

You may define custom permissions for your application in Entra ID and grant them to other consumer applications.
Permissions will appear as _claims_ in the consumer's token.
Your application can then use these claims to implement custom authorization logic.

!!! warning

    Custom permissions only apply in the context of _your own application_.
    They are _not_ global permissions.
    
    All the following conditions must be met for the custom permission to appear:
    
    1. The token is acquired by a consumer of your application.
    2. The consumer has been granted a custom permission in your access policy definition.
    3. The target _audience_ is your application.

#### Custom scopes

A _scope_ only applies to tokens acquired [on behalf of an employee][obo].

Applications defined in the access policy are always assigned the default scope named `defaultaccess`.

```yaml hl_lines="8-10" title="Example configuration"
spec:
  accessPolicy:
    inbound:
      rules:
        - application: app-a
          namespace: other-namespace
          cluster: other-cluster
          permissions:
            scopes:
              - "custom-scope"
```

The above configuration grants the application `app-a` the scope `custom-scope`.

Scopes will appear as a _space separated string_ in the `scp` claim within the user's token.

??? example "Example decoded on-behalf-of token (click to expand)"

    ```json hl_lines="17"
    {
      "aud": "8a5...",
      "iss": "https://login.microsoftonline.com/.../v2.0",
      "iat": 1624957183,
      "nbf": 1624957183,
      "exp": 1624961081,
      "aio": "AXQ...",
      "azp": "e37...",
      "azpacr": "1",
      "groups": [
        "2d7..."
      ],
      "name": "Navnesen, Navn",
      "oid": "15c...",
      "preferred_username": "Navn.Navnesen@nav.no",
      "rh": "0.AS...",
      "scp": "custom-scope defaultaccess",
      "sub": "6OC...",
      "tid": "623...",
      "uti": "i03...",
      "ver": "2.0"
    }
    ```

#### Custom roles

A _role_ only applies to tokens acquired [as an application][m2m] (machine-to-machine calls).

Applications defined in the access policy are always assigned the default role named `access_as_application`.

```yaml hl_lines="8-10" title="Example configuration"
spec:
  accessPolicy:
    inbound:
      rules:
        - application: app-a
          namespace: other-namespace
          cluster: other-cluster
          permissions:
            roles:
              - "custom-role"
```

The above configuration grants the application `app-a` the role `custom-role`.

Roles will appear in the `roles` claim as an _array of strings_ within the application's token.

??? example "Example decoded client credentials token (click to expand)"

    ```json hl_lines="12-15"
    {
      "aud": "8a5...",
      "iss": "https://login.microsoftonline.com/.../v2.0",
      "iat": 1624957347,
      "nbf": 1624957347,
      "exp": 1624961247,
      "aio": "E2Z...",
      "azp": "e37...",
      "azpacr": "1",
      "oid": "933...",
      "rh": "0.AS...",
      "roles": [
        "access_as_application",
        "custom-role"
      ],
      "sub": "933...",
      "tid": "623...",
      "uti": "kbG...",
      "ver": "2.0"
    }
    ```

## Claims

Notable claims in tokens from Entra ID.
For a complete list of claims, see the [Access Token Claims Reference in Entra ID](https://learn.microsoft.com/en-us/entra/identity-platform/access-token-claims-reference).
We only use v2.0 tokens.

`azp` (_authorized party_)

:   The [client ID](../explanations/README.md#client-id) of the application that requested the token (this would be your consumer).

`azp_name` (_authorized party name_)

:   Human-readable [client name](../explanations/README.md#client-name) of the consumer application that requested the token.
    This complements the client ID found in the `azp` claim and is intended for display purposes only.

    Not guaranteed to be unique. Should **not** be used for authorization.

`groups`

:   JSON array of [group identifiers](../explanations/README.md#group-identifier) that the user is a member of:
    ```json
    {
      "groups": [
        "43451d82-19cd-4828-918d-cbf7d5b572ec",
        "8f0bd3b2-9d3d-4f27-8543-5938db3e6a3e",
        "2d7..."
      ]
    }
    ```

    Used to implement group-based authorization logic in your application.

    **Only appears in flows where an end-user is involved**, i.e. either [login] or [on-behalf-of][obo].

    In order for a group to appear in the claim, all the following conditions must be true:

    - The given user is a direct member of the group.
    - The group has been [granted access to the application](../how-to/secure.md#users).

`idtyp` (_identity type_)

:   This is a special claim used to determine whether a token is a [machine-to-machine][m2m] (app-only) token or a [on-behalf-of][obo] (user) token.

    A token is a machine-to-machine token if and only if this claim exists and has the value equal to `app`.

{%- if tenant() == "nav" %}

`NAVident`

:   Internal identifier for the employees in NAV.

    **Only appears in flows where an end-user is involved**, i.e. either [login] or [on-behalf-of][obo].

{%- endif %}

`roles`

:   JSON array of roles that the application has access to:
    ```json
    {
      "roles": [
        "access_as_application",
        "role-a",
        "role-b"
      ]
    }
    ```

    **Only appears in [machine-to-machine][m2m] tokens**.

    Consumers defined in the [access policy](../how-to/secure.md#applications) are always assigned the default role named `access_as_application`.
    You can optionally define and grant them [custom roles](#custom-roles).

`scp` (_scope_)

:   The value of this claim is a _space-separated string_ that lists the scopes that the application has access to:
    ```json
    {
       "scp": "defaultaccess scope1 scope2"
    }
    ```

    **Only appears in [on-behalf-of][obo] tokens**.

    Consumers defined in the [access policy](../how-to/secure.md#applications) are always assigned the default scope named `defaultaccess`.
    You can optionally define and grant them [custom scopes](#custom-scopes).

## Manual Token Validation

{% include 'auth/partials/validate-manually.md' %}

**Issuer Validation**

Validate that the `iss` claim has a value that is equal to either:

1. the `AZURE_OPENID_CONFIG_ISSUER` environment variable, or
2. the `issuer` property from the [metadata discovery document](../../explanations/README.md#well-known-url-metadata-document).
   The document is found at the endpoint pointed to by the `AZURE_APP_WELL_KNOWN_URL` environment variable.

**Audience Validation**

Validate that the `aud` claim is equal to the `AZURE_APP_CLIENT_ID` environment variable.

**Signature Validation**

Validate that the token is signed with a public key published at the JWKS endpoint.
This endpoint URI can be found in one of two ways:

1. the `AZURE_OPENID_CONFIG_JWKS_URI` environment variable, or
2. the `jwks_uri` property from the metadata discovery document.
   The document is found at the endpoint pointed to by the `AZURE_APP_WELL_KNOWN_URL` environment variable.

**Claims Validation**

[Other claims](../reference/README.md#claims) may be present in the token. Validation of these claims is optional.

## Runtime Variables & Credentials

Your application will automatically be injected with the following environment variables at runtime.

| Environment Variable                | Description                                                                                             |
|-------------------------------------|---------------------------------------------------------------------------------------------------------|
| `NAIS_TOKEN_ENDPOINT`               | Used to [:dart: consume an API as an application](../how-to/consume-m2m.md).                            |
| `NAIS_TOKEN_EXCHANGE_ENDPOINT`      | Used to [:dart: consume an API on behalf of an employee](../how-to/consume-obo.md).                     |
| `NAIS_TOKEN_INTROSPECTION_ENDPOINT` | Used to [:dart: secure your API](../how-to/secure.md) or [:dart: log in employees](../how-to/login.md). |

For further details about these endpoints, see the [OpenAPI specification](../../reference/README.md#openapi-specification).

## Spec

For all possible configuration options, see the [:books: Nais application reference](../../../workloads/application/reference/application-spec.md#azure).

## Tenants

Available [tenants](../explanations/README.md#tenants) in Entra ID.

{%- if tenant() == "nav" %}
NAV has two tenants in Entra ID:

| Tenant Name       | Description        |
|-------------------|--------------------|
| `nav.no`          | Production tenant  |                                                                                                                                                                                              |
| `trygdeetaten.no` | Development tenant |

!!! info "Logging into the `trygdeetaten.no` tenant"

    The `trygdeetaten.no` tenant is used for development purposes.
    To log in to this tenant, you will need a separate account other than your personal NAV account.

    There are two types of accounts you can use:

    1. **Synthetic test accounts**: Visit the [IDA self-service portal](https://ida.intern.nav.no/). See the [#ida](https://nav-it.slack.com/archives/CA9GVNYRE) channel on Slack for details.
    1. **Personal account**: Visit [navikt/devuser-check](https://github.com/navikt/devuser-check/blob/main/README.md) and see the "FAQ" section. Otherwise, consult the [#tech-azure](https://nav-it.slack.com/archives/C0190RZ6HB4) channel on Slack.
{%- endif %}

See also [`.spec.azure.application.tenant`](../../../workloads/application/reference/application-spec.md#azureapplicationtenant).

## Troubleshooting

This section lists common problems and solutions.

### Missing application access policy

Your application (named `A` in the examples below) attempts to consume another application (named `B`).

When requesting a token from Entra ID, your application may receive a `400 Bad Request` with an `invalid_grant` error response and the following message:

> **AADSTS501051**:
>
> Application `'<client ID>'` (`<cluster>:<namespace>:<A>`) is not assigned to a role for the application '`api://<cluster>.<namespace>.<B>`' (`<cluster>:<namespace>:<B>`)"

Or the other variant:

> **AADSTS65001**:
>
> The user or administrator has not consented to use the application with ID '`<client ID>`' named '`<cluster>:<namespace>:<A>`'.
>
> Send an interactive authorization request for this user and resource.

???+ success "Solution / Answer"

    - Ensure that the [scope value](../explanations/README.md#scopes) in your application's request follows the correct format:

        `api://<cluster>.<namespace>.<application>/.default`

    - Ensure that application `B`'s [access policy](../how-to/secure.md#applications) includes application `A`.
    - If all else fails, request assistance in the `#nais` channel on Slack.

### Missing user access policy

When attempting to sign-in or perform the on-behalf-of flow, an application may receive a `400 Bad Request` with an `invalid_grant` error response and the following message:

> **AADSTS50105**:
>
> Your administrator has configured the application `<cluster>:<namespace>:<A>` ('`<client id>`') to block users unless they are specifically granted ('assigned') access to the application.
>
> The signed in user '{EmailHidden}' is blocked because they are not a direct member of a group with access, nor had access directly assigned by an administrator.
>
> Please contact your administrator to assign access to this application

???+ success "Solution / Answer"

    - Ensure that application `A` has configured [user access](../how-to/secure.md#users).
    - Ensure that the given user is a _direct_ member of any configured groups).
    - If all else fails, request assistance in the `#nais` channel on Slack.

### Tenant mismatch for signed-in user

While attempting to log in, you may receive the following error message from Entra ID:

> Selected user account does not exist in tenant '`some-tenant`' and cannot access the application '`<client-id>`' in that tenant.
>
> The account needs to be added as an external user in the tenant first.
>
> Please use a different account.

???+ success "Solution / Answer"

    - Ensure that the user uses an account that matches your application's [tenant](../reference/README.md#tenants) when logging in.
    - If all else fails, request assistance in the `#nais` channel on Slack.

[login]: ../how-to/login.md
[m2m]: ../how-to/consume-m2m.md
[obo]: ../how-to/consume-obo.md

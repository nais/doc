---
tags: [entra-id, azure-ad, reference]
conditional: [tenant, nav]
---

# Entra ID reference

## Spec

For all possible configuration options, see the [:books: Nais application reference](../../../workloads/application/reference/application-spec.md#azure).

## Runtime variables & credentials

Your application will automatically be injected with the following environment variables at runtime.

| Environment Variable                | Description                                                                                             |
|-------------------------------------|---------------------------------------------------------------------------------------------------------|
| `NAIS_TOKEN_ENDPOINT`               | Used to [:dart: consume an API as an application](../how-to/consume-m2m.md).                            |
| `NAIS_TOKEN_EXCHANGE_ENDPOINT`      | Used to [:dart: consume an API on behalf of an employee](../how-to/consume-obo.md).                     |
| `NAIS_TOKEN_INTROSPECTION_ENDPOINT` | Used to [:dart: secure your API](../how-to/secure.md) or [:dart: log in employees](../how-to/login.md). |

For further details about these endpoints, see the [OpenAPI specification](../../reference/README.md#openapi-specification).

### Variables for manually validating tokens

These variables are optional and should only be used for [manually validating tokens](#manual-token-validation) when:

- :dart: [securing your API with Entra ID](../how-to/secure.md), or
- :dart: [logging in employees with Entra ID](../how-to/login.md)

| Name                           | Description                                                                                                              |
|:-------------------------------|:-------------------------------------------------------------------------------------------------------------------------|
| `AZURE_APP_CLIENT_ID`          | [Client ID](../explanations/README.md#client-id) that uniquely identifies the application in Entra ID.                   |
| `AZURE_APP_WELL_KNOWN_URL`     | The well-known URL for the [metadata discovery document](../../explanations/README.md#well-known-url-metadata-document). |
| `AZURE_OPENID_CONFIG_ISSUER`   | `issuer` from the [metadata discovery document](../../explanations/README.md#issuer).                                    |
| `AZURE_OPENID_CONFIG_JWKS_URI` | `jwks_uri` from the [metadata discovery document](../../explanations/README.md#jwks-endpoint-public-keys).               |

`AZURE_APP_WELL_KNOWN_URL` is optional if you're using `AZURE_OPENID_CONFIG_ISSUER` and `AZURE_OPENID_CONFIG_JWKS_URI` directly.

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
    - The group has been [granted access to the application](../how-to/secure.md#user-access).

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

    Consumers defined in the [access policy](../how-to/secure.md#application-access) are always assigned the default role named `access_as_application`.
    You can optionally define and grant them [custom roles](#custom-roles).

`scp` (_scope_)

:   The value of this claim is a _space-separated string_ that lists the scopes that the application has access to:
```json
{
   "scp": "defaultaccess scope1 scope2"
}
```

    **Only appears in [on-behalf-of][obo] tokens**.

    Consumers defined in the [access policy](../how-to/secure.md#application-access) are always assigned the default scope named `defaultaccess`.
    You can optionally define and grant them [custom scopes](#custom-scopes).

## Access policies

### Application access

{% include 'auth/entra-id/partials/app-access.md' %}

### User access

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

Your application (named `your-application` in the examples below) attempts to consume another application (named `target-application`).

When requesting a token from Entra ID, your application may receive a `400 Bad Request` with an `invalid_grant` error response and the following message:

> **AADSTS501051**:
>
> Application `'<client ID>'` (`<cluster>:<namespace>:<your-application>`) is not assigned to a role for the application '`api://<cluster>.<namespace>.<target-application>`'

Or the other variant:

> **AADSTS65001**:
>
> The user or administrator has not consented to use the application with ID '`<client ID>`' named '`<cluster>:<namespace>:<your-application>`'.
>
> Send an interactive authorization request for this user and resource.

???+ success "Solution / Answer"

    - Ensure that the [scope](../explanations/README.md#scopes) or `target` parameter for your request follows the correct format:

        `api://<cluster>.<namespace>.<target-application>/.default`

    - Ensure that the target application has configured an inbound [access policy](../how-to/secure.md#application-access) that grants your application access to the target application.
    - If all else fails, request assistance in the `#nais` channel on Slack.

### Missing user access policy

When attempting to sign-in or perform the on-behalf-of flow, an application may receive a `400 Bad Request` with an `invalid_grant` error response and the following message:

> **AADSTS50105**:
>
> Your administrator has configured the application `<cluster>:<namespace>:<application>` ('`<client id>`') to block users unless they are specifically granted ('assigned') access to the application.
>
> The signed in user '{EmailHidden}' is blocked because they are not a direct member of a group with access, nor had access directly assigned by an administrator.
>
> Please contact your administrator to assign access to this application

???+ success "Solution / Answer"

    - Ensure that the application has configured appropriate [user access policies](../how-to/secure.md#user-access).
    - Ensure that the given user is a _direct_ member of any configured groups.
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

## Manual token validation

{% include 'auth/partials/validate-manually.md' %}

**Issuer validation**

Validate that the `iss` claim has a value that is equal to either:

1. the `AZURE_OPENID_CONFIG_ISSUER` environment variable, or
2. the `issuer` property from the [metadata discovery document](../../explanations/README.md#well-known-url-metadata-document).
   The document is found at the endpoint pointed to by the `AZURE_APP_WELL_KNOWN_URL` environment variable.

**Audience validation**

Validate that the `aud` claim is equal to the `AZURE_APP_CLIENT_ID` environment variable.

**Signature validation**

Validate that the token is signed with a public key published at the JWKS endpoint.
This endpoint URI can be found in one of two ways:

1. the `AZURE_OPENID_CONFIG_JWKS_URI` environment variable, or
2. the `jwks_uri` property from the metadata discovery document.
   The document is found at the endpoint pointed to by the `AZURE_APP_WELL_KNOWN_URL` environment variable.

**Claims validation**

[Other claims](#claims) may be present in the token.
Your application should validate these other claims according to your own requirements.

[login]: ../how-to/login.md
[m2m]: ../how-to/consume-m2m.md
[obo]: ../how-to/consume-obo.md

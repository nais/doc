# Configuration

## Spec

Minimal example below. 

See the complete specification in the [NAIS manifest](../../../nais-application/application.md#azure).

=== "nais.yaml"
    ```yaml
    spec:
      azure:
        application:
          enabled: true

      # optional, only relevant if your application receives requests from consumers
      accessPolicy:
        inbound:
          rules:
            - application: app-a
              namespace: othernamespace
              cluster: dev-fss

      # required for on-premises only
      webproxy: true 
    ```

## Network Connectivity

Azure AD is an [external service](../../../nais-application/access-policy.md#external-services).
Outbound access to the Azure AD hosts is automatically configured by the platform.

You do _not_ have to explicitly configure outbound access to Azure AD yourselves in GCP.

If you're on-premises however, you must enable and use [`webproxy`](../../../nais-application/application.md#webproxy).

## Access Policy

Access to applications should generally follow the _principle of least privilege_.
That is, any user or application should only have the minimum access required that is required for their legitimate purpose.

Access is granted by configuring access policies. We'll guide you through it below.

!!! warning

    Users are not granted access by default.
    You must explicitly [grant access to users](#users).

    Applications are also not granted access by default.
    You must explicitly grant applications access by [pre-authorizing](#pre-authorization) them.

### Users

**Users are not granted access by default.**
You must explicitly grant user access either for [specific groups](#groups) or for [all users](#users).

If _no groups are assigned_ and _all-user access is disabled_, then **end-users will not have access** to authenticate with your application.

This applies for your application if it does at least one of the following:

- Performs sign-ins of end-users using the [OpenID Connect Auth Code flow](usage.md#openid-connect-authorization-code-flow)
- Has consumers that performs exchanges of end-user tokens using the [OAuth 2 On-behalf-of flow](usage.md#oauth-20-on-behalf-of-grant)

#### All Users

If you want to allow _all_ users in the Azure AD tenant to access your application, you must explicitly enable this:

```yaml hl_lines="5"
spec:
  azure:
    application:
      enabled: true
      allowAllUsers: true
```

#### Groups

In many cases, you want to only allow certain groups of users to have access to your application.

The user must be a _direct_ member of the group.
Nested groups are not supported, i.e. membership of a group within a group does not propagate to the parent group.

First, declare which groups that should be assigned and granted access to the application:

```yaml hl_lines="5-7"
spec:
  azure:
    application:
      enabled: true
      claims:
        groups:
          - id: "<object ID of group in Azure AD>"
```

!!! warning

    **Ensure that the [object ID](README.md#group-identifier) for the group actually exists in Azure AD for your environment.**

    Non-existing groups (object IDs) will be skipped.

Then, explicitly disable all-user access:

```yaml hl_lines="5"
spec:
  azure:
    application:
      enabled: true
      allowAllUsers: false
      claims:
        groups:
          - id: "<object ID of group in Azure AD>"
```

If a user is not a _direct_ member of any of the configured groups, Azure AD will now return an error if the user attempts to sign in to your application.

Consumers using the [on-behalf-of flow](usage.md#oauth-20-on-behalf-of-grant) will also receive failures if the user is not a member of any of the configured groups.

#### Fine-Grained Group-Based Access Control

If you need more fine-grained access controls, you will need to handle authorization in your application by using the `groups` claim found in the user's [JWT](../concepts/tokens.md#jwt).

The `groups` claim in user tokens contains a list of [group object IDs](README.md#group-identifier) if and only if:

1. The group is explicitly assigned to the application, and
2. The user is a _direct_ member of the group

Because no groups are assigned to the application by default, the claim is also omitted by default.

You can assign groups to your application by specifying the following:

```yaml hl_lines="5-8"
spec:
  azure:
    application:
      enabled: true
      claims:
        groups:
          - id: "<object ID of group in Azure AD>"
```

This configuration only affects tokens that are acquired where your application is the intended audience (i.e. [scoped](README.md#scopes) to your application).

All user tokens acquired for your application will now include the `groups` claim.

??? example "Example decoded on-behalf-of token (click to expand)"

    ```json hl_lines="10-12"
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
        "scp": "defaultaccess",
        "sub": "6OC...",
        "tid": "623...",
        "uti": "i03...",
        "ver": "2.0"
    }
    ```

Your application can then use this claim to implement custom user authorization logic.

### Applications

**Applications are not granted access by default.**
You must explicitly grant consumer applications access by [pre-authorizing](#pre-authorization) them.

This applies if your application has consumers that use either the [client credentials](usage.md#oauth-20-client-credentials-grant) or the [on-behalf-of](usage.md#oauth-20-on-behalf-of-grant) flows. 

#### Pre-authorization

Pre-authorize consumers by specifying the following:

```yaml
spec:
  accessPolicy:
    inbound:
      rules:
        - application: app-a

        - application: app-b
          namespace: other-namespace

        - application: app-c
          namespace: other-namespace
          cluster: other-cluster
```

The above configuration will pre-authorize the Azure AD clients belonging to:

* application `app-a` running in the **same namespace** and **same cluster** as your application
* application `app-b` running in the namespace `other-namespace` in the **same cluster**
* application `app-c` running in the namespace `other-namespace` in the cluster `other-cluster`

!!! warning

    - These rules are _eventually consistent_, which means they might take a few minutes to fully propagate.
    - If you're pre-authorizing a client provisioned through `aad-iac`, see the [legacy](legacy.md#pre-authorization) section.

If you require more fine-grained access control, continue reading below.

#### Fine-Grained Access Control

You may define custom permissions for your client in Azure AD. These can be granted to consumer clients individually as an
extension of the [access policy](#pre-authorization) definitions described above.

When granted to a consumer, the permissions will appear in their respective claims in tokens targeted to your application.
Your application can then use these claims to implement custom authorization logic. Note that it is your application's
responsibility to authorize or reject requests based on the permissions present in the token.

!!! warning

    Custom permissions only apply in the context of _your own application_ as an API provider.
    **They are _not_ global permissions.**

    These permissions only appear in tokens when all the following conditions are met:
    
    1. The token is acquired by a consumer of your application.
    2. The consumer has been granted a custom permission in your access policy definition.
    3. The target _audience_ is your application.

##### Custom Scopes

A _scope_ only applies to tokens acquired using the
[OAuth 2.0 On-Behalf-Of flow](usage.md#oauth-20-on-behalf-of-grant)
(service-to-service calls on behalf of an end-user).

Applications defined in the access policy are always assigned the default scope named `defaultaccess`.

Grant scopes to consumers by specifying the following:

```yaml hl_lines="8-10"
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

##### Custom Roles

A _role_ only applies to tokens acquired using the
using the [OAuth 2.0 client credentials flow](usage.md#oauth-20-client-credentials-grant)
(service-to-service calls).

Applications defined in the access policy are always assigned the default role named `access_as_application`.

Grant roles to consumers by specifying the following:

```yaml hl_lines="8-10"
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

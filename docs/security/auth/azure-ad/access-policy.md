# Access Policy

Access to applications should generally follow the _principle of least privilege_.
That is, any user or application should only have the minimum access required that is required for their legitimate purpose.

Access is granted by configuring access policies. We'll guide you through it below.

## Users

**Users are not granted access by default.**
You must explicitly grant user access either for [specific groups](access-policy.md#groups) or for [all users](access-policy.md#users).

If _no groups are assigned_ and _all-user access is disabled_, then **end-users will not have access** to authenticate with your application.

This applies for your application if it does at least one of the following:

- Performs sign-ins of end-users using the [OpenID Connect Auth Code flow](usage.md#openid-connect-authorization-code-flow)
- Has consumers that performs exchanges of end-user tokens using the [OAuth 2 On-behalf-of flow](usage.md#oauth-20-on-behalf-of-grant)

### All Users

If you want to allow _all_ users in the Azure AD tenant to access your application, you must explicitly enable this:

```yaml hl_lines="5"
spec:
  azure:
    application:
      enabled: true
      allowAllUsers: true
```

### Groups

In many cases, you want to only allow certain groups of users to have access to your application.

Declare which [groups](concepts.md#groups) that should be assigned and granted access to the application:

```yaml hl_lines="5-8"
spec:
  azure:
    application:
      enabled: true
      allowAllUsers: false
      claims:
        groups:
          - id: "<object ID of group in Azure AD>"
```

!!! warning

    **Ensure that the [object ID](concepts.md#group-identifier) for the group actually exists in Azure AD for your environment.**

    Non-existing groups will be skipped.

The given user must be a _direct_ member of _at least one_ of the specified groups.
Nested groups are not supported, i.e. membership of a group within a group does not propagate to the parent group.

This also controls the [`groups` claim](configuration.md#groups) for a user token.

## Applications

### Pre-authorization

For proper scoping of tokens when performing calls between clients, one must either:

1. Request a token for a specific client ID using the client using the [OAuth 2.0 client credentials flow](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-client-creds-grant-flow) \(service-to-service calls\).
2. Exchange a token containing an end-user context using the [OAuth 2.0 On-Behalf-Of flow](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-on-behalf-of-flow) \(service-to-service calls on behalf of an end-user\).

Azure AD will enforce authorization for both flows. In other words, you **must** pre-authorize any consumer clients for your application.

This is declared by specifying [`spec.accessPolicy.inbound.rules[]`](../../../nais-application/application.md#accesspolicy):

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

    - These rules are _eventually consistent_, which means it might take a few minutes to propagate throughout Azure AD.
    - Any client referred to **must** already exist in Azure AD in order to be assigned the access policy permissions.
    - If you're pre-authorizing a client provisioned through `aad-iac`, ensure that you've read the [legacy](legacy.md#pre-authorization) section.
    - **Clients defined in the Spec that do _not_ exist in Azure AD at deploy time will be skipped.** If a non-existing client is created at a later time, we'll attempt to automatically [force a resynchronization](operations.md#forcing-resynchronization).

If you require more fine-grained access control, see [Fine-Grained Access Control](#fine-grained-access-control).

### Fine-Grained Access Control

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

#### Custom Scopes

A _scope_ only applies to tokens acquired using the
[OAuth 2.0 On-Behalf-Of flow](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-on-behalf-of-flow)
(service-to-service calls on behalf of an end-user).

Applications defined in the access policy are always assigned the default scope named `defaultaccess`.

!!! example "Example configuration"

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

???+ example "Example decoded on-behalf-of token"
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

#### Custom Roles

A _role_ only applies to tokens acquired using the
using the [OAuth 2.0 client credentials flow](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-client-creds-grant-flow)
(service-to-service calls).

Applications defined in the access policy are always assigned the default role named `access_as_application`.

!!! example "Example configuration"

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

???+ example "Example decoded client credentials token"

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

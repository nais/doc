# Access Policy

## Pre-authorization

For proper scoping of tokens when performing calls between clients, one must either:

1. Request a token for a specific client ID using the client using the [OAuth 2.0 client credentials flow](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-client-creds-grant-flow) \(service-to-service calls\).
2. Exchange a token containing an end-user context using the [OAuth 2.0 On-Behalf-Of flow](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-on-behalf-of-flow) \(service-to-service calls on behalf of an end-user\).

Azure AD will enforce authorization for both flows. In other words, you **must** pre-authorize any consumer clients for your application.

Clients that should receive and validate access tokens from other clients should pre-authorize said clients.

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

!!! danger

    - Any client referred to **must** already exist in Azure AD in order to be assigned the access policy permissions.
    - Be aware of dependency order when deploying your applications for the first time in each cluster with provisioning enabled.
    - If you're pre-authorizing a client provisioned through `aad-iac`, ensure that you've read the [legacy](legacy.md#pre-authorization) section.
    - **Clients defined in the Spec that do _not_ exist in Azure AD at deploy time will be skipped.**
    - **[Assignments will not be automatically retried.](operations.md#forcing-resynchronization)**

The above configuration will pre-authorize the Azure AD clients belonging to:

* application `app-a` running in the **same namespace** and **same cluster** as your application
* application `app-b` running in the namespace `other-namespace` in the **same cluster**
* application `app-c` running in the namespace `other-namespace` in the cluster `other-cluster`

The default permissions will grant consumer clients the role `access_as_application`, which will only appear in tokens acquired with the client credentials flow (i.e. service-to-service requests).

If you require more fine-grained access control, see [Fine-Grained Access Control](#fine-grained-access-control).

## Fine-Grained Access Control

You may define custom permissions for your client in Azure AD. These can be granted to consumer clients individually as an
extension of the [access policy](#access-policy) definitions described above.

When granted to a consumer, the permissions will appear in their respective claims in tokens targeted to your application.
Your application can then use these claims to implement custom authorization logic.

!!! warning

    Custom permissions only apply in the context of _your own application_ as an API provider.
    **They are _not_ global permissions.**

    These permissions only appear in tokens when all the following conditions are met:
    
    1. The token is acquired by a consumer of your application.
    2. The consumer has been granted a custom permission in your access policy definition.
    3. The target _audience_ is your application.

### Custom Scopes

A _scope_ only applies to tokens acquired using the
[OAuth 2.0 On-Behalf-Of flow](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-on-behalf-of-flow)
(service-to-service calls on behalf of an end-user).

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

!!! info
    Any custom scopes granted will appear as a _space separated string_ in the `scp` claim.

### Custom Roles

A _role_ only applies to tokens acquired using the
using the [OAuth 2.0 client credentials flow](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-client-creds-grant-flow)
(service-to-service calls).

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

!!! info
    Any custom roles granted will appear in the `roles` claim, which is an _array of strings_.

## Groups

By default, all users within the tenant is allowed to log in to your application.

For some use cases, it is desirable to restrict access to smaller groups of users.

This can be done by explicitly declaring which groups are allowed to access the application:

```yaml hl_lines="5-7"
spec:
  azure:
    application:
      enabled: true
      claims:
        groups:
          - id: "<object ID of group in Azure AD>"
```

Azure AD will now only allow sign-ins and token exchanges with the on-behalf-of flow if a given user is a _direct_ member of at least _one of_ the groups declared.

This also controls the `groups` claim for a user token, which will only contain groups that are both explicitly assigned to the application _and_ which the user is a direct member of.

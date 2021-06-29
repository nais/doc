---
description: Enabling authentication and authorization in internal web applications.
---

# Azure AD

!!! warning
    This feature is only available in [team namespaces](../../clusters/team-namespaces.md)

## Abstract

!!! abstract
    The NAIS platform provides support for simple, declarative provisioning of an Azure AD client configured with sensible defaults.

    An Azure AD client allows your application to leverage Azure AD for authentication and authorization.

    The most common cases include:

    * User \(employees only\) sign-in with SSO, using [OpenID Connect with Authorization Code flow](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow)
    * Request chains involving an end-user whose identity and permissions should be propagated through each service/web API, using the [OAuth 2.0 On-Behalf-Of flow](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-on-behalf-of-flow)
    * Daemon / server-side applications for server-to-server interactions without a user, using the [OAuth 2.0 client credentials flow](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-client-creds-grant-flow)

!!! info
    **See the** [**NAV Security Guide**](https://security.labs.nais.io/) **for NAV-specific usage of this client.**

## Concepts

The following describes a few core concepts in Azure AD referred to throughout this documentation.

### Tenants

A tenant represents an organization in Azure AD. Each tenant will have their own set of applications, users and groups. In order to log in to a tenant, you must use an account specific to that tenant.

NAV has two tenants in Azure AD:

- `nav.no` - available in all clusters, default tenant for production clusters
- `trygdeetaten.no` - only available in `dev-*`-clusters, default tenant for development clusters

!!! warning
    If your use case requires you to use `nav.no` in the `dev-*`-clusters, then you must [explicitly configure this](azure-ad.md#tenants_1).
    Note that you _cannot_ interact with clients or applications across different tenants.

The same application in different clusters will result in unique Azure AD clients, with each having their own client IDs and access policies. For instance, the following applications in the same `nav.no` tenant will result in separate, unique clients in Azure AD:

* `app-a` in `dev-gcp` 
* `app-a` in `prod-gcp`

### Naming format

An Azure AD client has an associated name within a tenant. NAIS uses this name for lookups and identification.

All clients provisioned through NAIS will be registered in Azure AD using the following naming scheme:

```text
<cluster>:<namespace>:<app-name>
```

???+ example
    ```text
    dev-gcp:aura:nais-testapp
    ```

!!! tip "Scopes in token requests"
    Equivalently, the identifier used to refer to the application almost follows the same format.

    The only notable difference is that `:` replaced by `.`

    ```text
    api://<cluster>.<namespace>.<app-name>
    ```

    The above means that instead of using the API provider's client ID:

    ```text
    api://e89006c5-7193-4ca3-8e26-d0990d9d981f/.default
    ```

    you can do this:

    ```text
    api://dev-gcp.aura.nais-testapp/.default
    ```

### Client ID

An Azure AD client has its own ID that uniquely identifies the client within a tenant, and is used in authentication requests to Azure AD.

Your application's Azure AD client ID is available at multiple locations:

1. The environment variable `AZURE_APP_CLIENT_ID`, available inside your application at runtime
2. In the Kubernetes resource - `kubectl get azureapp <app-name> -o wide`
3. The [Azure Portal](https://portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/RegisteredApps). You may have to click on `All applications` if it does not show up in `Owned applications`. Search using the naming scheme mentioned earlier: `<cluster>:<namespace>:<app>`.

## Configuration

### Spec

See the [NAIS manifest](../../nais-application/application.md#azureapplication).

### Getting started

=== "nais.yaml"
    ```yaml
    spec:
      azure:
        application:
          enabled: true
            
          # optional, enum of {trygdeetaten.no, nav.no}
          # defaults to trygdeetaten.no in dev-* clusters, nav.no in production
          tenant: nav.no

          # optional, generated defaults shown
          replyURLs: 
            - "https://my-app.dev.nav.no/oauth2/callback"

          # optional
          claims:
            extra:
              - "NAVident"
              - "azp_name"
            groups:
              - id: "<object ID of Azure AD group>"

      # optional, only relevant if your application should receive requests from consumers
      accessPolicy:
        inbound:
          rules:
            - application: app-a
              namespace: othernamespace
              cluster: dev-fss
              permissions:
                roles:
                  - "custom-role"
                scopes:
                  - "custom-scope"
            - application: app-b

      # required for on-premises only
      webproxy: true 
    ```

### Accessing external hosts

Azure AD is a third-party service outside of our clusters, which is not reachable by default like most third-party services.

#### Google Cloud Platform \(GCP\)

The following [outbound external hosts](../../nais-application/access-policy.md#external-services) are automatically added when enabling this feature:

* `login.microsoftonline.com`
* `graph.microsoft.com`

You do not need to specify these explicitly.

#### On-premises

You must enable and use [`webproxy`](../../nais-application/application.md#webproxy) for external communication.

### Reply URLs

> A redirect URI, or reply URL, is the location that the authorization server will send the user to once the app has been successfully authorized, and granted an authorization code or access token. The code or token is contained in the redirect URI or reply token so it's important that you register the correct location as part of the app registration process.
>
> -- Microsoft's documentation on [reply URLs](https://docs.microsoft.com/en-us/azure/active-directory/develop/reply-url)

#### Defaults

If you have _not_ specified any reply URLs, we will automatically generate a reply URL for each ingress specified using this formula:

```text
spec.ingresses[n] + "/oauth2/callback"
```

???+ example
    In other words, this:

    ```yaml hl_lines="2-4"
    spec:
      ingresses:
        - "https://my.application.dev.nav.no"
        - "https://my.application.dev.nav.no/subpath"
      azure:
        application:
          enabled: true
    ```

    will generate a spec equivalent to this:

    ```yaml  hl_lines="2-4 7-10"
    spec:
      ingresses:
        - "https://my.application.dev.nav.no"
        - "https://my.application.dev.nav.no/subpath"
      azure:
        application:
          enabled: true
          replyURLs:
            - "https://my.application.dev.nav.no/oauth2/callback"
            - "https://my.application.dev.nav.no/subpath/oauth2/callback"
    ```

#### Overriding explicitly

You may set reply URLs manually by specifying `spec.azure.application.replyURLs[]`:

???+ example
    ```yaml hl_lines="5-7"
    spec:
      azure:
        application:
          enabled: true
          replyURLs:
            - "https://my.application.dev.nav.no/oauth2/callback"
            - "https://my.application.dev.nav.no/subpath/oauth2/callback"
    ```

Doing so will **replace** all of the [default auto-generated reply URLs](#defaults).

!!! danger
    If you do override the reply URLs, make sure that you specify **all** the URLs that should be registered for the Azure AD client.

    **Ensure that these URLs conform to the restrictions and limitations of** [**reply URLs**](https://docs.microsoft.com/en-us/azure/active-directory/develop/reply-url) **as specified by Microsoft.**

### Tenants

To explicitly target a specific [tenant](azure-ad.md#tenants), add a `spec.azure.application.tenant` to your `nais.yaml`:

```yaml
spec:
  azure:
    application:
      enabled: true
      
      # enum of {trygdeetaten.no, nav.no}
      tenant: trygdeetaten.no 
```

### Access Policy

#### Pre-authorization

For proper scoping of tokens when performing calls between clients, one must either:

1. Request a token for a specific client ID using the client using the [OAuth 2.0 client credentials flow](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-client-creds-grant-flow) \(service-to-service calls\).
2. Exchange a token containing an end-user context using the [OAuth 2.0 On-Behalf-Of flow](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-on-behalf-of-flow) \(service-to-service calls on behalf of an end-user\).

Azure AD will enforce authorization for both flows. In other words, you **must** pre-authorize any consumer clients for your application.

Clients that should receive and validate access tokens from other clients should [pre-authorize](azure-ad.md#pre-authorization) said clients. 
These are declared by specifying [`spec.accessPolicy.inbound.rules[]`](../../nais-application/application.md#accesspolicy):

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
    - If you're pre-authorizing a client provisioned through `aad-iac`, ensure that you've read the [legacy](#pre-authorization_1) section.
    - **Clients defined in the Spec that do _not_ exist in Azure AD at deploy time will be skipped.**
    - **[Assignments will not be automatically retried.](#forcing-resynchronization)**

The above configuration will pre-authorize the Azure AD clients belonging to:

* application `app-a` running in the **same namespace** and **same cluster** as your application 
* application `app-b` running in the namespace `other-namespace` in the **same cluster**
* application `app-c` running in the namespace `other-namespace` in the cluster `other-cluster`

The default permissions will grant consumer clients the role `access_as_application`, which will only appear in tokens acquired with the client credentials flow (i.e. service-to-service requests).

If you require more fine-grained access control, see [Fine-Grained Access Control](#fine-grained-access-control).

### Fine-Grained Access Control 

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

#### Custom Scopes

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

???+ example "Decoded on-behalf-of token"
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

#### Custom Roles

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

### Groups

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

## Usage

!!! info
    **See the** [**NAV Security Guide**](https://security.labs.nais.io/) **for NAV-specific usage.**


### Runtime Variables & Credentials

The following environment variables and files \(under the directory `/var/run/secrets/nais.io/azure`\) are available at runtime:

---

#### `AZURE_APP_CLIENT_ID`

???+ note

    Azure AD client ID. Unique ID for the application in Azure AD
    
    Example value: `e89006c5-7193-4ca3-8e26-d0990d9d981f`

---

#### `AZURE_APP_CLIENT_SECRET`

???+ note

    Azure AD client secret, i.e. password for [authenticating the application to Azure AD](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-client-creds-grant-flow#first-case-access-token-request-with-a-shared-secret) 

    Example value: `b5S0Bgg1OF17Ptpy4_uvUg-m.I~KU_.5RR`

---

#### `AZURE_APP_JWKS`

???+ note

    A JWK Set as defined in [RFC7517 section 5](https://tools.ietf.org/html/rfc7517#section-5). This will always contain a single key, i.e. `AZURE_APP_JWK` - the newest key registered.

    Example value: 

    ```javascript
    {
      "keys": [
        {
            "use": "sig",
            "kty": "RSA",
            "kid": "jXDxKRE6a4jogcc4HgkDq3uVgQ0",
            "n": "xQ3chFsz...",
            "e": "AQAB",
            "d": "C0BVXQFQ...",
            "p": "9TGEF_Vk...",
            "q": "zb0yTkgqO...",
            "dp": "7YcKcCtJ...",
            "dq": "sXxLHp9A...",
            "qi": "QCW5VQjO...",
            "x5c": [
              "MIID8jCC..."
            ],
            "x5t": "jXDxKRE6a4jogcc4HgkDq3uVgQ0",
            "x5t#S256": "AH2gbUvjZYmSQXZ6-YIRxM2YYrLiZYW8NywowyGcxp0"
        }
      ]
    }
    ``` 

---

#### `AZURE_APP_JWK`

???+ note

    Private JWK as defined in [RFC7517](https://tools.ietf.org/html/rfc7517), i.e. a JWK with the private RSA key for creating signed JWTs when [authenticating to Azure AD with a certificate](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-client-creds-grant-flow#second-case-access-token-request-with-a-certificate).

    Example value: 

    ```javascript
    {
      "use": "sig",
      "kty": "RSA",
      "kid": "jXDxKRE6a4jogcc4HgkDq3uVgQ0",
      "n": "xQ3chFsz...",
      "e": "AQAB",
      "d": "C0BVXQFQ...",
      "p": "9TGEF_Vk...",
      "q": "zb0yTkgqO...",
      "dp": "7YcKcCtJ...",
      "dq": "sXxLHp9A...",
      "qi": "QCW5VQjO...",
      "x5c": [
        "MIID8jCC..."
      ],
      "x5t": "jXDxKRE6a4jogcc4HgkDq3uVgQ0",
      "x5t#S256": "AH2gbUvjZYmSQXZ6-YIRxM2YYrLiZYW8NywowyGcxp0"
    }
    ```

---

#### `AZURE_APP_PRE_AUTHORIZED_APPS`

???+ note
    
    A JSON string. List of names and client IDs for the valid \(i.e. those that exist in Azure AD\) applications defined in [`spec.accessPolicy.inbound.rules[]`](../../nais-application/application.md#accesspolicy)
    
    Example value: 

    ```javascript
    [
      {
        "name": "dev-gcp:othernamespace:app-a",
        "clientId": "381ce452-1d49-49df-9e7e-990ef0328d6c"
      },
      {
        "name": "dev-gcp:aura:app-b",
        "clientId": "048eb0e8-e18a-473a-a87d-dfede7c65d84"
      }
    ]
    ```

---

#### `AZURE_APP_TENANT_ID`

???+ note

    The Azure AD tenant ID for which the Azure AD client resides in. 

    Example value: `77678b69-1daf-47b6-9072-771d270ac800` 

---

#### `AZURE_APP_WELL_KNOWN_URL`

???+ note

    The well-known URL to the [metadata discovery document](https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderConfig) for the specific tenant in which the Azure AD client resides in.

    Example value: `https://login.microsoftonline.com/77678b69-1daf-47b6-9072-771d270ac800/v2.0/.well-known/openid-configuration`

---

#### `AZURE_OPENID_CONFIG_ISSUER`

???+ note

    `issuer` from the metadata discovery document.

    Example value: `https://login.microsoftonline.com/77678b69-1daf-47b6-9072-771d270ac800/v2.0`

---

#### `AZURE_OPENID_CONFIG_JWKS_URI`

???+ note

    `jwks_uri` from the metadata discovery document.

    Example value: `https://login.microsoftonline.com/77678b69-1daf-47b6-9072-771d270ac800/discovery/v2.0/keys`

---

#### `AZURE_OPENID_CONFIG_TOKEN_ENDPOINT`

???+ note

    `token_endpoint` from the metadata discovery document.

    Example value: `https://login.microsoftonline.com/77678b69-1daf-47b6-9072-771d270ac800/oauth2/v2.0/token`

## Administration

### Owner Access

Generally, configuration of the Azure AD client should be done through [`nais.yaml`](azure-ad.md#configuration). In most cases you will not need to configure the application through the [Azure Portal](https://portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/RegisteredApps) at all.

Access is limited in accordance with the principle of least privilege.

Rules:

- If your Azure AD client exists in the `nav.no` tenant, your [team](https://github.com/navikt/teams)'s owners will automatically be given owner access. 
- Otherwise, the application will not be assigned any owners.
- Special cases such as extra permissions are manually handled on a case-by-case basis.

If you are not registered as an owner in your team, you should either have an existing owner promote you or have them perform whatever you need.

## Legacy

This section only applies if you have an existing Azure AD client registered in the [IaC repository](https://github.com/navikt/aad-iac).

### Why migrate?

* Declarative provisioning, straight from your application's [`nais.yaml`](../../nais-application/application.md#azureapplication)
* No longer dependent on manual user approvals in multiple IaC repositories
* No longer dependent on Vault
* Credentials are rotated regularly, completely transparent to the application. This ensures that credentials are fresh and lessens the impact in the case of exposure.
* The exact same feature is present in the [GCP](../../clusters/gcp.md) clusters, which simplifies [migration](../../clusters/migrating-to-gcp.md).

### Tenants

### Pre-authorization

Communication between legacy clients provisioned through [aad-iac](https://github.com/navikt/aad-iac) and clients provisioned through NAIS requires some additional configuration.

???+ info "Scenario 1"

    #### Allowing a NAIS client to access an aad-iac client

    Prerequisites:

    * You have a legacy client registered in the [`aad-iac`](https://github.com/navikt/aad-iac) repository.
    * You would like to [pre-authorize](azure-ad.md#pre-authorization) client provisioned through NAIS.

    Steps:

    * Refer to the NAIS client in aad-iac using its _fully qualified name_ \(see [naming format](azure-ad.md#naming-format)\):
    
    ```
    <cluster>:<namespace>:<app-name>
    ```
    
    Example:    

    * See [this example in aad-iac](https://github.com/navikt/aad-iac/blob/073664fc5e455c17f1a33ec394c4f07464ae0a2f/prod/hookd.yaml#L4-L5).

---

???+ info "Scenario 2"

    #### Allowing an aad-iac client to access a NAIS client

    Prerequisites:

    * You have a client provisioned through NAIS.
    * You would like to [pre-authorize](azure-ad.md#pre-authorization) a legacy client registered in the [`aad-iac`](https://github.com/navikt/aad-iac) repository.

    Steps:

    * The legacy client **must** follow the expected [naming format](azure-ad.md#naming-format). Follow step 1 and step 2 in the [migration guide](azure-ad.md#migration-guide-step-by-step).
    * Refer to the legacy client [analogously to a NAIS application](azure-ad.md#pre-authorization)
    
    Example:
    
    * See [this example in aad-iac](https://github.com/navikt/aad-iac/blob/8972c11dd23158aab0cae2f080d77869137eb809/nonprod/team-rocket.yaml#L2)
    * Pre-authorizing the legacy client in nais.yaml:

    ```yaml
    spec:
      accessPolicy:
        inbound:
          rules:
          - application: dkif
            namespace: team-rocket
            cluster: dev-fss
    ```

### Migration guide - step by step

The following describes the steps needed to migrate an existing legacy client where you wish to keep the existing client ID and configuration.

If keeping the existing client ID and configuration is not important, it should be much easier to just provision new clients instead.

!!! warning
    Be aware of the [differences in tenants](azure-ad.md#tenants) between the [IaC repository](https://github.com/navikt/aad-iac) and NAIS:

    * `nonprod` -> `trygdeetaten.no`
    * `prod` -> `nav.no`

???+ check "Step 1 - Rename your application in the Azure Portal" 
    The `Display name` of the application registered in the [Azure Portal](https://portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/RegisteredApps) **must** match the [expected format](azure-ad.md#naming-format).

    * Go to the **`Branding`** tab for your client in the [Azure Portal](https://portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/RegisteredApps).
    * Update the `Name`.

???+ check "Step 2 - Update your application \(and any dependants\) in the IaC repository"

    * Ensure the **`name`** of the client registered in the [IaC repository](https://github.com/navikt/aad-iac) is updated to match the name set in [step 1](azure-ad.md#step-1-rename-your-application-in-the-azure-portal).
    * Ensure that any clients that has a reference to the previous name in their **`preauthorizedapplications`** is also updated. 

???+ check "Step 3 - Deploy your NAIS application with Azure AD provisioning enabled"

    * See [getting started](azure-ad.md#getting-started).

???+ check "Step 4 - Delete your application from the IaC repository"

    * Verify that everything works after the migration
    * Delete the application from the [IaC repository](https://github.com/navikt/aad-iac) in order to maintain a single source of truth

## Operations

### Permanently deleting a client

!!! warning
    Permanent deletes are irreversible. Only do this if you are certain that you wish to completely remove the client from Azure AD.

When an `AzureAdApplication` resource is deleted from a Kubernetes cluster, the client is by default _not_ deleted from Azure AD.

!!! info "Details"
    In Kubernetes terms, the `Application` resource owns the `AzureAdApplication` resource.

    [Deletion](../../deployment/delete-app.md) of the `Application` will trigger a deletion of the `AzureAdApplication`. 
    The _actual_ client registered in Azure AD however is not deleted by default.

    If the `AzureAdApplication` resource is recreated -- for example by redeploying a previously deleted `Application` -- it will thus retain the same Azure AD client ID.

If you want to completely delete the client from Azure AD, you must add the following annotation to the `AzureAdApplication` resource:

```bash
kubectl annotate azureapp <app> azure.nais.io/delete=true
```

When this annotation is in place, deleting the `AzureAdApplication` resource from Kubernetes will trigger removal of the client from Azure AD.

### Forcing resynchronization

Synchronization to Azure AD only happens when at least one of two things happen:

1. Any [spec.azure.* or spec.accessPolicy.inbound.rules[]](#spec) value has changed.
2. An annotation is applied to the resource:

```bash
kubectl annotate azureapp <app> azure.nais.io/resync=true
```

The annotation is removed after synchronization. It can then be re-applied to trigger new synchronizations.

### Forcing credential rotation

Credential rotation happens automatically on a regular basis. 

However, if you need to trigger rotation manually you may do so by applying the following annotation:

```bash
kubectl annotate azureapp <app> azure.nais.io/rotate=true
```

You should then restart your pods so that the new credentials are re-injected:

```bash
kubectl rollout restart deployment <app>
```

## FAQ / Troubleshooting

### First steps

If something isn't quite right, these `kubectl` commands may be of help in diagnosing and reporting errors.

To get a summary of the status of your Azure AD client:

```bash
kubectl get azureapp <app> -owide 
```

For additional details:

```bash
kubectl describe azureapp <app>
```

### "Application `Alice` is not assigned to a role for the application `Bob`"

An application may receive the following `400 Bad Request` response error when requesting a token from Azure AD:

```json
{
  "error": "invalid_grant",
  "error_description": "AADSTS501051: Application '<client ID>'(<cluster>:<namespace>:<alice>) is not assigned to a role for the application 'api://<cluster>.<namespace>.<bob>'(<cluster>:<namespace>:<bob>)",
  ...
}
```

???+ faq "Answer"

    - Ensure that Bob's [access policy](#pre-authorization) includes Alice.
    - Run `kubectl get azureapp bob -owide` to check the current count of assigned applications for Bob. 
    - Run `kubectl describe azureapp bob` to check the detailed statuses for all of Bob's desired pre-authorized applications. 
    - If Bob added Alice to its access policy before Alice existed in Azure AD, try to [resynchronize](#forcing-resynchronization) Bob:
        - `kubectl annotate azureapp Bob azure.nais.io/resync=true`
    - If all else fails, ask an adult in the `#nais` channel on Slack.

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

## Access Policy

!!! warning

    Users are not granted access by default.
    You must explicitly [grant access to users](access-policy.md#users).

    Applications are also not granted access by default.
    You must explicitly grant applications access by [pre-authorizing](access-policy.md#pre-authorization) them.

See [access policy](access-policy.md) for further details.

## Accessing external hosts

Azure AD is a third-party service outside of our clusters, which is not reachable by default like most third-party services.

### Google Cloud Platform \(GCP\)

The following [outbound external hosts](../../../nais-application/access-policy.md#external-services) are automatically added when enabling this feature:

* `login.microsoftonline.com`
* `graph.microsoft.com`

You do not need to specify these explicitly.

### On-premises

You must enable and use [`webproxy`](../../../nais-application/application.md#webproxy) for external communication.

## Reply URLs

> A redirect URI, or reply URL, is the location that the authorization server will send the user to once the app has been successfully authorized, and granted an authorization code or access token. The code or token is contained in the redirect URI or reply token so it's important that you register the correct location as part of the app registration process.
>
> -- Microsoft's documentation on [reply URLs](https://docs.microsoft.com/en-us/azure/active-directory/develop/reply-url)

### Defaults

If you have _not_ specified any reply URLs, we will automatically generate a reply URL for each ingress specified using this formula:

```text
spec.ingresses[n] + "/oauth2/callback"
```

???+ example
    In other words, this:

    ```yaml hl_lines="2-4"
    spec:
      ingresses:
        - "https://my.application.intern.dev.nav.no"
        - "https://my.application.intern.dev.nav.no/subpath"
      azure:
        application:
          enabled: true
    ```

    will generate a spec equivalent to this:

    ```yaml  hl_lines="2-4 7-10"
    spec:
      ingresses:
        - "https://my.application.intern.dev.nav.no"
        - "https://my.application.intern.dev.nav.no/subpath"
      azure:
        application:
          enabled: true
          replyURLs:
            - "https://my.application.intern.dev.nav.no/oauth2/callback"
            - "https://my.application.intern.dev.nav.no/subpath/oauth2/callback"
    ```

### Overriding explicitly

You may set reply URLs manually by specifying `spec.azure.application.replyURLs[]`:

???+ example
    ```yaml hl_lines="5-7"
    spec:
      azure:
        application:
          enabled: true
          replyURLs:
            - "https://my.application.intern.dev.nav.no/oauth2/callback"
            - "https://my.application.intern.dev.nav.no/subpath/oauth2/callback"
    ```

Doing so will **replace** all of the [default auto-generated reply URLs](#defaults).

!!! danger
    If you do override the reply URLs, make sure that you specify **all** the URLs that should be registered for the Azure AD client.

    **Ensure that these URLs conform to the restrictions and limitations of** [**reply URLs**](https://docs.microsoft.com/en-us/azure/active-directory/develop/reply-url) **as specified by Microsoft.**

## Tenants

To explicitly target a specific [tenant](concepts.md#tenants), add a `spec.azure.application.tenant` to your `nais.yaml`:

```yaml
spec:
  azure:
    application:
      enabled: true
      
      # enum of {trygdeetaten.no, nav.no}
      tenant: trygdeetaten.no 
```

## Single-Page Application

Azure AD supports the [OAuth 2.0 Auth Code Flow with PKCE](https://docs.microsoft.com/en-us/azure/active-directory/develop/scenario-spa-overview) for logins from client-side/browser single-page-applications.

However, the support for this must be explicitly enabled to avoid issues with CORS:

```yaml
spec:
  azure:
    application:
      enabled: true
      singlePageApplication: true
```

## Claims

[JWTs](../concepts/tokens.md#jwt) contain claims about the principal that the token represents.

The claims below are _additional_ claims that are specific to Azure AD. They are opt-in and not included by default.
These additional claims only affect tokens that are acquired where your application is the intended audience (i.e. 
[scoped](concepts.md#scopes) to your application).

### Groups

The `groups` claim in user tokens is by default omitted due to potential issues with the token's size when used in cookies.

Sometimes however, it is desirable to check for group membership for a given user's token.
Start by defining all [Azure AD group](concepts.md#groups) IDs that should appear in user tokens:

```yaml hl_lines="5-8"
spec:
  azure:
    application:
      enabled: true
      claims:
        groups:
          - id: "<object ID of group in Azure AD>"
```

!!! warning

    **Ensure that the [object ID](concepts.md#group-identifier) for the group actually exists in Azure AD for your environment.**

    Non-existing groups (object IDs) will be skipped.

Now all user tokens acquired for your application will include the `groups` claim.

The claim will only contain groups that are **both explicitly assigned to the application _and_ which the user is a direct member of**.

???+ example "Example decoded on-behalf-of token"

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

If you wish to also restrict sign-ins and token exchanges with the on-behalf-of flow to users in these groups, 
see the [groups section in access policy](access-policy.md#groups).

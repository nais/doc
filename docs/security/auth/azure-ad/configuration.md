# Configuration

## Spec

See the complete specification in the [NAIS manifest](../../../nais-application/application.md#azure).

## Getting started

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

          # optional, defaults shown
          singlePageApplication: false

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

### Overriding explicitly

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

However, this requires some [explicit configuration](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow#redirect-uri-setup-required-for-single-page-apps) to avoid issues with CORS:

```yaml
spec:
  azure:
    application:
      enabled: true
      singlePageApplication: true
```

## Access Policy

See [access policy](access-policy.md).

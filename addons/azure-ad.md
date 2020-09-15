---
description: >
  Provisioning and configuration of accompanying Azure AD application for authentication and authorization in web applications.
---

# Azure AD Application

{% hint style="warning" %}
This feature is only available in [team namespaces](../clusters/team-namespaces.md)
{% endhint %}

An accompanying Azure AD application can be automatically provisioned to your NAIS application. 

The Azure AD application will be configured with sane defaults to enable usage in both authentication and/or authorization 
for web applications.

We generate a Kubernetes Secret containing the values needed for your application to integrate with Azure AD, 
e.g. credentials and URLs. The secret will automatically be mounted to the pods of your application during deploy.

Every deploy will trigger rotation of credentials, invalidating any passwords and keys that are not in use. 
_In use_ in this context refers to all credentials that are currently mounted to an existing pod - 
regardless of their status (Running, CrashLoopBackOff, etc.). In other words, credential rotation should happen
with zero downtime.

## Spec

See the [NAIS manifest](../nais-application/reference.md#spec-azure-application).

## Usage

### Azure AD for Authentication & Authorization

Generally, the Azure AD application allows your application to leverage Azure AD for authentication and authorization.

The most common cases include:

- User (employees only) sign-in with SSO, using [OpenID Connect with Authorization Code flow]
- Request chains involving an end-user whose identity and permissions should be propagated through each service/web API, 
using the [OAuth 2.0 On-Behalf-Of flow]
- Daemon / server-side applications for server-to-server interactions without a user, 
using the [OAuth 2.0 client credentials flow]

See the [NAV Security Guide] for NAV-specific usage.

Otherwise, depending on your application and its intended usage, 
see the [Microsoft identity platform documentation].

### Getting Started

#### Minimal Example

The very minimal example configuration required in [`nais.yaml`](../nais-application/reference.md#spec-azure-application)
to enable auto-provisioning of an Azure AD application for your application.

```yaml
apiVersion: "nais.io/v1alpha1"
kind: "Application"
metadata:
  name: nais-testapp
  namespace: aura
  labels:
    team: aura
spec:
  image: navikt/nais-testapp:65.0.0
  azure:
    application:
      enabled: true
  # required for on-premises only
  webproxy: true
  # required for GCP only
  accessPolicy:
    outbound:
      external:
        - host: login.microsoftonline.com
```

This will register an Azure AD application using the following naming scheme: 
```
<cluster>:<metadata.namespace>:<metadata.name>
```

For the example above, the result would be:
```
dev-gcp:aura:nais-testapp
```

You may find the application in the [Azure Portal].

#### Full Example

```yaml
apiVersion: "nais.io/v1alpha1"
kind: "Application"
metadata:
  name: nais-testapp
  namespace: aura
  labels:
    team: aura
spec:
  image: navikt/nais-testapp:65.0.0
  azure:
    application:
      enabled: true
  ingresses:
    - "https://my.application"
    - "https://my.application.dev.nais.io"
  accessPolicy:
    inbound:
      rules:
        - application: app-a
          namespace: othernamespace
        - application: app-b
    # required for GCP only
    outbound:
      external:
        - host: login.microsoftonline.com
  # required for on-premises only
  webproxy: true
```

### Reply URLs

> A redirect URI, or reply URL, is the location that the authorization server will send the user to once the app has been 
>successfully authorized, and granted an authorization code or access token. The code or token is contained in the 
>redirect URI or reply token so it's important that you register the correct location as part of the app registration process.
>
> -- <cite>Microsoft's documentation on [reply URLs]</cite>

{% hint style="info" %}
Note that `spec.azure.application.replyURLs[]` can be omitted if `spec.ingresses` are specified.
{% endhint %}

Each ingress specified will generate a reply URL using the formula:

```
spec.ingresses[n] + "/oauth2/callback"
```

In other words, this:

```yaml
spec:
  azure:
    application:
      enabled: true
  ingresses:
    - "https://my.application"
    - "https://my.application.dev.nais.io"
```

is equivalent to this:

```yaml
spec:
  azure:
    application:
      enabled: true
      replyURLs:
        - "https://my.application/oauth2/callback"
        - "https://my.application.dev.nais.io/oauth2/callback"
  ingresses:
    - "https://my.application"
    - "https://my.application.dev.nais.io"
```

You may override the reply URLs manually by specifying `spec.azure.application.replyURLs[]`. 

{% hint style="danger" %}
Specifying `spec.azure.application.replyURLs[]` will replace all the auto-generated reply URLs.

If you do override the reply URLs, make sure that you specify **all** the URLs that should be
registered for the Azure AD application.

**Ensure that these URLs conform to the restrictions and limitations of [reply URLs] as specified by Microsoft.**
{% endhint %}

### Pre-Authorized Applications

If your application should accept access tokens from other applications using the [on-behalf-of] flow, 
a [`spec.accessPolicy.inbound.rules[]`](../nais-application/reference.md#spec-accesspolicy-gcp-only) must be present:

```yaml
spec:
  accessPolicy:
    inbound:
      rules:
        - application: app-a
          namespace: othernamespace
        - application: app-b
```

The above configuration will allow on-behalf-of access token requests from:

- application `app-a` in namespace `othernamespace`
- application `app-b` running in the same namespace as your application

{% hint style="danger" %}
These applications **must** already exist in Azure AD in order to be assigned the access policy permissions. 

The applications must also have been provisioned through NAIS.

Any application that does not exist in Azure AD will be skipped.

If you do provision Azure AD applications afterwards for any pre-authorized applications and want to assign access policy
permissions to these, then make sure to re-deploy your application to provision the correct permissions.
{% endhint %}

### Owner Access

In most cases you will not need to manually change things for your application in the Azure Portal as the Azure AD 
application is automatically configured with sane defaults, with most other common options 
available to be configured through [`nais.yaml`](../nais-application/reference.md#spec-azure-application). 

If your Azure AD application exists in the default (`nav.no`) tenant, your [team]'s owners will automatically be given owner access. 
Otherwise, the application will not be assigned any owners.
Special cases such as extra permissions are handled manually on a case-by-case basis.

If you are not registered as an owner in your team, you should either have an existing owner promote you, or request the
existing owner(s) to do whatever you may want. Access has knowingly been limited to discourage unnecessary privileges 
being given out to users that do not require them.

### Tenants

A tenant represents an organization in Azure Active Directory. In layman's terms, each tenants will have their own 
set of applications, users and groups. In order to log in to a tenant, you must use an account specific to that tenant.

The default Azure AD tenant for applications provisioned through NAIS in *all clusters* is `nav.no`. 
If your use case requires you to use `trygdeetaten.no` in the `dev-*`-clusters, then you must 
[explicitly configure this](#specifying-tenants).

Do note that the same application in different clusters are unique Azure AD applications, 
with each having their own client IDs and access policies. For instance, `app-a` in `dev-gcp` is a 
separate application in Azure AD from `app-a` in `prod-gcp`, even if they both exist in the Azure AD tenant `nav.no`.

#### Specifying tenants

To explicitly target a specific tenant, add a `spec.azure.application.tenant` to your `nais.yaml`:

```yaml
spec:
  azure:
    application:
      enabled: true
      tenant: trygdeetaten.no # enum of {trygdeetaten.no, nav.no}, defaults to nav.no if omitted
```

### Runtime Configuration and Credentials

Provisioning an Azure AD application produces a `Secret` resource that is automatically
mounted to the pods of your application. 

#### Contents

The following describes the contents of the aforementioned secret.

These are available as environment variables in your pod, as well as files at the path `/var/run/secrets/nais.io/azure`

| Name | Description |
|---|---|
| `AZURE_APP_CLIENT_ID` | Azure AD client ID. Unique ID for the application in Azure AD |
| `AZURE_APP_CLIENT_SECRET` | Azure AD client secret, i.e. password for [authenticating the application to Azure AD] |
| `AZURE_APP_JWKS` | Private JWKS, i.e. containing a JWK with the private RSA key for creating signed JWTs when [authenticating to Azure AD with a certificate]. This will always contain a single key, i.e. the newest key registered |
| `AZURE_APP_JWK` | Same as the above `AZURE_APP_JWKS`, just with the JWK unwrapped from the key set |
| `AZURE_APP_PRE_AUTHORIZED_APPS` | A JSON string. List of names and client IDs for the valid (i.e. those that exist in Azure AD) applications defined in [`spec.accessPolicy.inbound.rules[]`](../nais-application/reference.md#spec-accesspolicy-gcp-only) |
| `AZURE_APP_WELL_KNOWN_URL` | The well-known URL with the tenant for which the Azure AD application resides in |

#### Example reference `Secret` resource

This is automatically generated and mounted into your pod as environment variables and files. See the table above.

```yaml
---
apiVersion: v1
kind: Secret
metadata:
  name: <application-name>-<random-string>
  namespace: aura
  labels:
    team: aura
data:
  AZURE_APP_CLIENT_ID: e89006c5-7193-4ca3-8e26-d0990d9d981f
  AZURE_APP_CLIENT_SECRET: b5S0Bgg1OF17Ptpy4_uvUg-m.I~KU_.5RR
  AZURE_APP_JWKS: |
    {
      "keys": [
        {
          "use": "sig",
          ... 
          # same as below
        }
      ]
    }
  AZURE_APP_JWK: |
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
  AZURE_APP_PRE_AUTHORIZED_APPS: |
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
  AZURE_APP_WELL_KNOWN_URL: https://login.microsoftonline.com/77678b69-1daf-47b6-9072-771d270ac800/v2.0/.well-known/openid-configuration
```

### How to find your Client ID

Your application's Azure AD client ID is available at multiple locations:

1. The environment variable `AZURE_APP_CLIENT_ID`, available inside your application at runtime
2. In the Kubernetes resource - `kubectl get azureapp <app-name>`
3. The [Azure Portal]. You may have to click on `All applications` if it does not show up in `Owned applications`.
Search using the naming scheme mentioned earlier: `<cluster>:<namespace>:<app>`.

## Migrating from existing infrastructure-as-code ([IaC]) solution

### Why migrate?

- Declarative provisioning, straight from your application's [`nais.yaml`](../nais-application/reference.md#spec-azure-application)
- No longer dependent on manual user approvals in multiple IaC repositories
- No longer dependent on Vault
- Credentials are rotated on _every_ deploy, completely transparent to the application. 
This ensures that credentials are fresh and lessens the impact in the case of exposure.
- The exact same feature is present in the [GCP](../clusters/gcp.md) clusters, 
which simplifies [migration](../clusters/migrating-to-gcp.md).

### Differences

In general, the Azure AD application provisioned through NAIS are entirely new, unique instances with new client IDs 
and should be treated as such.

#### Tenants

Where the IaC solution defaulted to `trygdeetaten.no` for non-production environments, we now default to `nav.no`
for all environments and clusters.

If your use case requires you to use `trygdeetaten.no` in the `dev-*`-clusters, then you must 
[explicitly configure this](#specifying-tenants).

### Migrating - step-by-step

#### 1. Rename all your applications in the [IaC repository][IaC]

In order for NAIS to pick up and update your Azure AD application, the **`name`** of the application registered in 
the [IaC repository][IaC] should match the expected format:

```
<cluster>:<namespace>:<app-name>
```

E.g.

```
dev-gcp:aura:my-app
```

The list of names in **`preauthorizedapplications`** should also be updated to match this format for all the applications
that you're migrating.

Make sure to be aware of the differences in [tenants](#tenants) in the [IaC repository][IaC]:

- `nonprod` matches `trygdeetaten.no`
- `prod` matches `nav.no`

#### 2. Enable Azure AD provisioning for your NAIS app

See [getting started](#getting-started).

#### 3. Deploy your applications with Azure AD enabled

## Deletion

The Azure AD application is automatically deleted whenever the associated Application resource is deleted. 
In other words, if you delete your NAIS application the Azure AD application is also deleted. This will result in
a **_new and different_** client ID in Azure AD if you re-create the application after deletion.

[OpenID Connect with Authorization Code flow]: https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow
[OAuth 2.0 On-Behalf-Of flow]: https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-on-behalf-of-flow
[OAuth 2.0 client credentials flow]: https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-client-creds-grant-flow
[NAV Security Guide]: https://security.labs.nais.io/
[Microsoft identity platform documentation]: https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-v2-protocols
[authenticating to Azure AD with a certificate]: https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-client-creds-grant-flow#second-case-access-token-request-with-a-certificate
[authenticating the application to Azure AD]: https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-client-creds-grant-flow#first-case-access-token-request-with-a-shared-secret
[Azure Portal]: https://portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/RegisteredApps
[reply URLs]: https://docs.microsoft.com/en-us/azure/active-directory/develop/reply-url
[on-behalf-of]: https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-on-behalf-of-flow
[IaC]: https://github.com/navikt/aad-iac
[custom resource]: https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/
[team]: https://github.com/navikt/teams

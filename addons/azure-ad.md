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

## Getting Started

### Minimal Example

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

### Full Example

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

## Usage

### Azure AD for Authentication & Authorization

See the [NAV Security Guide] for NAV-specific usage.

Otherwise, depending on your application and its intended usage, 
see the [Microsoft identity platform documentation].

### Credentials / Secrets

Provisioning an Azure AD application will always produce a `Secret` resource that is automatically
mounted to the pods of your application. 

#### Path

The secret should be available as files at

```
/var/run/secrets/nais.io/azure
```

as well as environment variables.

#### Contents

The following describes the contents of the aforementioned secret.

##### `AZURE_APP_CLIENT_ID`

Azure AD client ID. Unique ID for the application in Azure AD.

Example value:

```
e89006c5-7193-4ca3-8e26-d0990d9d981f
```

##### `AZURE_APP_CLIENT_SECRET`

Azure AD client secret, i.e. password for [authenticating the application to Azure AD].

Example value:

```
b5S0Bgg1OF17Ptpy4_uvUg-m.I~KU_.5RR
```

##### `AZURE_APP_JWKS`

Private JWKS, i.e. containing a JWK with the private RSA key for creating signed JWTs when [authenticating to Azure AD with a certificate].

Example value:

```json
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

##### `AZURE_APP_PRE_AUTHORIZED_APPS`

A JSON string. List of names and client IDs for the valid (i.e. those that exist in Azure AD) applications defined in 
[`spec.accessPolicy.inbound.rules[]`](../nais-application/reference.md#spec-accesspolicy-gcp-only).

Example value:

```
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

##### `AZURE_APP_WELL_KNOWN_URL`

The well-known URL with the tenant for which the Azure AD application resides in.

Example value:

```
https://login.microsoftonline.com/77678b69-1daf-47b6-9072-771d270ac800/v2.0/.well-known/openid-configuration
```

### Finding your application's Azure AD client ID

Your application's Azure AD client ID is available at multiple locations:

1. The environment variable `AZURE_APP_CLIENT_ID`, available inside your application at runtime.
2. The [Azure Portal].
3. In the Kubernetes resource - `kubectl get azureapp <app-name> -o json | jq '.status.clientId'`

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

We've initially opted to use a single tenant (`nav.no`) to reduce confusion for users in terms of user accounts and logins.
However, this is not final. 
We may add support for using the development tenant as used in the existing IaC solution if this is a need that is desired.

Do note that the same application in different clusters will be different, unique Azure AD applications, 
with each having their own client IDs and access policies.

#### Owner Access

The Azure AD application is automatically configured with sane defaults, with most other common options 
available to be configured through [`nais.yaml`](../nais-application/reference.md#spec-azure-application). 

Thus, we've opted to not grant owner access to any of the team's members.

Any other use cases not covered is manually handled as of now, but this may change as needs arise.

#### Pre-Authorized Applications

There are a couple of pitfalls and gotchas you ought to avoid if your existing application has defined a 
list of [pre-authorized applications](#pre-authorized-applications):

{% hint style="danger" %}
**1. Referencing Azure AD applications provisioned through [IaC] from an application provisioned through NAIS**

Azure AD applications provisioned through NAIS are **not** able to reference existing Azure AD applications
provisioned through the existing IaC solution.
{% endhint %}

{% hint style="warning" %}
**2. Referencing this Azure AD application from an application provisioned through [IaC]**

An existing application provisioned through IaC can reference this Azure AD application by using the 
naming scheme as defined in [getting started](#getting-started).
{% endhint %}

Migrating an existing stack of applications should therefore be done in the following order:

1. Enable provisioning for all applications in all relevant clusters, but do not use the new credentials.
2. [Find the relevant client IDs](#finding-your-applications-azure-ad-client-id) and prepare your applications to reference these instead of the previous ones.
3. Prepare your application to use the new credentials instead of the previous ones.
4. Deploy to development; ensure that everything works as expected.
5. Repeat step 4 for production.

## Provisioning separately from NAIS Application

The Azure AD integration is implemented as a [custom resource] in our Kubernetes clusters. 
If you need an Azure AD application outside or separately from the NAIS Application abstraction, you may apply 
the custom resource manually through `kubectl` or as part of your deploy pipeline.

### Example

```azure-app.yaml```

```yaml
apiVersion: nais.io/v1
kind: AzureAdApplication
metadata:
  name: my-app
  namespace: my-team
spec:
  preAuthorizedApplications:
    - application: my-other-app
      cluster: dev-gcp
      namespace: my-team
    - application: some-other-app
      cluster: dev-gcp
      namespace: my-team
  logoutUrl: "https://my-app.dev.nav.no/oauth2/logout"
  replyUrls:
    - url: "https://my-app.dev.nav.no/oauth2/callback"
  secretName: azuread-my-app
```

Apply the resource to the cluster:

```
kubectl apply -f azure-app.yaml
```

## Deletion

The Azure AD application is automatically deleted whenever the associated Application resource is deleted. 
In other words, if you delete your NAIS application the Azure AD application is also deleted.

If you've provisioned the Azure AD application separately, you must manually delete the `azuread` resource:

```
kubectl delete azureapp <name>
```

[NAV Security Guide]: https://security.labs.nais.io/
[Microsoft identity platform documentation]: https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-v2-protocols
[authenticating to Azure AD with a certificate]: https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-client-creds-grant-flow#second-case-access-token-request-with-a-certificate
[authenticating the application to Azure AD]: https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-client-creds-grant-flow#first-case-access-token-request-with-a-shared-secret
[Azure Portal]: https://portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/RegisteredApps
[reply URLs]: https://docs.microsoft.com/en-us/azure/active-directory/develop/reply-url
[on-behalf-of]: https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-on-behalf-of-flow
[IaC]: https://github.com/navikt/aad-iac
[custom resource]: https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/

---
description: >
  Provisioning and configuration of accompanying Azure AD application.
---

# Azure AD Application

An accompanying Azure AD application can be automatically provisioned to your NAIS application. 

The Azure AD application will be configured with sane defaults. 

We generate a Kubernetes Secret containing the values needed for your application to integrate with Azure AD, 
e.g. credentials and URLs. The secret will automatically be mounted to the pods of your application during deploy.

Every deploy will trigger rotation of credentials, invalidating any passwords and keys that are not in use. 
_In use_ in this context refers to all credentials that are currently mounted to an existing pod - 
regardless of their status (Running, CrashLoopBackOff, etc.). In other words, credential rotation should happen
with zero downtime.

## Spec

See the [NAIS manifest](../nais-application/manifest.md#spec-azure-application`).

## Getting Started

### Minimal Example

The very minimal example configuration required in [`nais.yaml`](../nais-application/manifest.md#spec-azure-application`)
to enable auto-provisioning of an Azure AD application for your application.

```yaml
apiVersion: "nais.io/v1alpha1"
kind: "Application"
metadata:
  name: nais-testapp
  namespace: default
  labels:
    team: aura
spec:
  image: navikt/nais-testapp:65.0.0
  azure:
    application:
      enabled: true
```

This will register an Azure AD application using the following naming scheme: 
```
<cluster>:<metadata.namespace>:<metadata.name>
```

For the example above, the result would be:
```
dev-gcp:default:nais-testapp
```

You may find the application in the [Azure Portal].

### Full Example

```yaml
apiVersion: "nais.io/v1alpha1"
kind: "Application"
metadata:
  name: nais-testapp
  namespace: default
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
a [`spec.accessPolicy.inbound.rules[]`](../nais-application/manifest.md#spec-accesspolicy) must be present:

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

### Azure AD

See the [NAV Security Guide] for NAV-specific usage.

Otherwise, depending on your application and its intended usage, 
see the [Microsoft identity platform documentation].

### Credentials / Secrets

Provisioning an Azure AD application will always produce a `Secret` resource that is automatically
mounted to the pods of your application. 

#### Path

The secret should be available at

```
/var/run/secrets/nais.io/azure
```

#### Contents

The following describes the contents of that secret.

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

##### `AZURE_APP_JWKS_PRIVATE`

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

##### `AZURE_APP_JWKS_PUBLIC`

Public part of the aforementioned JWKS.

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

A JSON string. List of names and client IDs for the valid (i.e. those that exist in Azure AD) applications defined in [`spec.accessPolicy.inbound.rules[]`](../nais-application/manifest.md#spec-accesspolicy`).

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

[NAV Security Guide]: https://security.labs.nais.io/
[Microsoft identity platform documentation]: https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-v2-protocols
[authenticating to Azure AD with a certificate]: https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-client-creds-grant-flow#second-case-access-token-request-with-a-certificate
[authenticating the application to Azure AD]: https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-client-creds-grant-flow#first-case-access-token-request-with-a-shared-secret
[Azure Portal]: https://portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/RegisteredApps
[reply URLs]: https://docs.microsoft.com/en-us/azure/active-directory/develop/reply-url
[on-behalf-of]: https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-on-behalf-of-flow

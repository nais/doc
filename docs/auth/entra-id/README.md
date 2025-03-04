---
tags: [auth, entra-id, azure-ad, services, explanation]
conditional: [tenant, nav]
---

# Entra ID

[Entra ID](https://learn.microsoft.com/en-us/entra/identity-platform/) (formerly known as Azure Active Directory, Azure AD or AAD) is a cloud-based identity and access management service provided by Microsoft.

We use Entra ID as our internal identity provider for authenticating and authorizing both employees and applications.

Nais provides support for declarative registration and configuration of Entra ID resources.
These cover these distinct use cases:

## Log in employees

If you have an employee-facing application that requires authentication, you will need to integrate with Entra ID.
Nais simplifies this by providing a [login proxy](../explanations/README.md#login-proxy) with endpoints to easily handle login, logout, and user sessions.

Your application is responsible for verifying that inbound requests have valid [tokens](../explanations/README.md#tokens).

:dart: [**Learn how to log in employees**](how-to/login.md)

## Secure your API

To secure your API with Entra ID, you'll need to grant consumers access to your application.
Once configured, your consumers can acquire a token from Entra ID to [consume your API](#consume-an-api).

Your application code must verify inbound requests by validating the included tokens.

:dart: [**Learn how to secure your API with Entra ID**](how-to/secure.md)

## Consume an API

If your application needs to consume another API secured with Entra ID, you need to acquire a token.

There are two types of flows for acquiring tokens, depending on the context of the request:

### Consume on behalf of employee

This flow is for machine-to-machine requests _on behalf of_ an employee end-user.

To consume an API on behalf of an employee, you'll need to exchange their token for a new token:

```mermaid
graph LR
  Consumer["User / Consumer API"] -- "`request with
  employee token`" --> Application["Your app"]
  Application -- "`exchange
  employee token`" ----> AAD["Entra ID"]
  AAD -- "`issue new token
  for Other API`" ----> Application
  Application -- use new token ----> OtherAPI["Other API"]
```

The new token preserves the employee's identity context and is only valid for the specific API you want to access.

:dart: [**Learn how to consume an API on behalf of an employee**](how-to/consume-obo.md)
 
### Consume as application

This flow is for machine-to-machine requests _without_ any end-user involvement.

To consume an API as the application itself, you'll need to acquire a token:

```mermaid
graph LR
  Application["Your app"] -- "`request token
  for Other API`" ---> AzureAD["Entra ID"]
  AzureAD -- "`issue new token
  for Other API`" ---> Application
  Application -- "`use new token`" ---> API["Other API"]
```

:dart: [**Learn how to consume an API as an application**](how-to/consume-m2m.md)

## Generate a token for development

In some cases, you want to locally develop and test against a secured API in the development environments.
You will need a token to access said API.

:dart: [**Learn how to generate a token for development**](how-to/generate.md)

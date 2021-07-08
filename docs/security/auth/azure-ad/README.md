---
description: Enabling authentication and authorization in internal web applications.
---

# Azure AD

!!! warning
    This feature is only available in [team namespaces](../../../clusters/team-namespaces.md)

!!! abstract
    The NAIS platform provides support for simple, declarative provisioning of an Azure AD client configured with sensible defaults.

    An Azure AD client allows your application to leverage Azure AD for authentication and authorization.

    The most common cases include:

    * User \(employees only\) sign-in with SSO, using [OpenID Connect with Authorization Code flow](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow)
    * Request chains involving an end-user whose identity and permissions should be propagated through each service/web API, using the [OAuth 2.0 On-Behalf-Of flow](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-on-behalf-of-flow)
    * Daemon / server-side applications for server-to-server interactions without a user, using the [OAuth 2.0 client credentials flow](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-client-creds-grant-flow)

!!! info
    **See the** [**NAV Security Guide**](https://security.labs.nais.io/) **for NAV-specific usage of this client.**

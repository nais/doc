---
description: Enabling authentication and authorization in internal web applications.
---

# Azure AD

!!! abstract
    The NAIS platform provides support for simple, declarative provisioning of an 
    [Azure AD client](https://docs.microsoft.com/en-us/azure/active-directory/develop/app-objects-and-service-principals) 
    configured with sensible defaults.

    An Azure AD client allows your application to leverage Azure AD for authentication and authorization.

    The most common cases include:

    * User (employees only) sign-in with SSO, using [OpenID Connect with Authorization Code flow](usage.md#openid-connect-authorization-code-flow)
    * Request chains involving an end-user whose identity and permissions should be propagated through each service/web API, using the [OAuth 2.0 On-Behalf-Of flow](usage.md#oauth-20-on-behalf-of-grant)
    * Daemon / server-side applications for machine-to-machine interactions without a user, using the [OAuth 2.0 client credentials flow](usage.md#oauth-20-client-credentials-grant)

    The feature described in [configuration](configuration.md) only _provisions_ and _configures_ an Azure AD client.
    **Your application is responsible for using the client to implement the desired use case.**

    If you need functionality to sign-in end-users with said client, we also provide a separate [sidecar](sidecar.md) proxy that handles this.

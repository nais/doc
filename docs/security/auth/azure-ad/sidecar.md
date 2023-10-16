---
description: Reverse-proxy that handles automatic authentication and login/logout flows for Azure AD.
---

# Azure AD sidecar

!!! warning "Availability"

    The sidecar is only available in the [Google Cloud Platform](../../../clusters/gcp.md) clusters.

## Description

The sidecar is a reverse proxy that provides functionality to perform Azure AD login and logout for end-users.

!!! info "Prerequisites"
    - If you're unfamiliar with Azure AD, review the [core concepts](README.md#concepts).
    - Ensure that you define at least one [ingress](../../../nais-application/application.md#ingresses) for your application.
    - Ensure that you configure [user access](configuration.md#users) for your application. **Users are not granted access by default**.

## Spec

!!! danger "Port Configuration"
    The sidecar will occupy and use the ports `7564` and `7565`.

    Ensure that you do **not** bind to these ports from your application as they will be overridden.

Minimal example below.

=== "nais.yaml"
    ```yaml
    spec:
      azure:
        application:
          enabled: true
        sidecar:
          enabled: true
    ```

See the [NAIS manifest reference](../../../nais-application/application.md#azuresidecar) for the complete specification.

The above example will provision a unique Azure AD application, as well as enabling a sidecar that uses said application.

For configuration of the Azure AD application itself, see [the Configuration page](configuration.md).

## Usage

Try out a basic user flow:

1. Visit your application's login endpoint (`https://<ingress>/oauth2/login`) to trigger a login.
2. After logging in, you should be redirected back to your application.
3. All further requests to your application should now have an `Authorization` header with the user's access token as a [Bearer token](../concepts/tokens.md#bearer-token)
4. Visit your application's logout endpoint (`https://<ingress>/oauth2/logout`) to trigger a logout.
5. You will be redirected to Azure AD for logout, and then back to your application's ingress.
6. Success!

**See [Wonderwall](../../../addons/wonderwall.md#usage) for further usage details.**

### Token Validation

!!! danger "Your application is responsible for securing its own endpoints"

    - If a request does not contain an `Authorization` header, the request should be considered unauthenticated and access should be denied.
    - If a request has an `Authorization` header that contains a [JWT], the token must be validated before access is granted.

Your application should [validate the claims and signature](usage.md#token-validation) for the JWT Bearer `access_token` attached by the sidecar in the `Authorization` header.

## Next Steps

The access token that Wonderwall provides should only be accepted and used by your application.

In order to access other applications, you should exchange the token in order to get a new token that is correctly scoped to access a given application.

For Azure AD, use the [on-behalf-of grant](usage.md#oauth-20-on-behalf-of-grant) to do this.

[JWT]: ../concepts/tokens.md#jwt

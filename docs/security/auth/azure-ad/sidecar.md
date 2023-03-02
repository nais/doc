---
description: Reverse-proxy that handles automatic authentication and login/logout flows for Azure AD.
---

# Azure AD sidecar

!!! warning "Availability"
    This feature is only available in **dev-gcp** and **prod-gcp**.

## Description

A reverse proxy that provides functionality to handle Azure AD login and logout.

!!! info "Prerequisites"
    - Ensure that you first [enable Azure AD for your application](configuration.md).
    - Ensure that you define at least one [ingress](../../../nais-application/application.md#ingresses) for your application.
    - No users are granted access by default. You must explicitly grant user access either for [specific groups](access-policy.md#groups) or for [all users](access-policy.md#users).

## Spec

!!! danger "Port Configuration"
    The sidecar will occupy and use the ports `7564` and `7565`.

    Ensure that you do **not** bind to these ports from your application as they will be overridden.

=== "nais.yaml"
    ```yaml
    spec:
      azure:
        application:
          enabled: true
        sidecar:
          enabled: true

          # everything below is optional, defaults shown
          autoLogin: false
          errorPath: ""
    ```

See the [NAIS manifest](../../../nais-application/application.md#azuresidecar) for details.

## Usage

!!! tip
    See the [Wonderwall](../../../appendix/wonderwall.md) appendix for usage details.

### Token Validation

!!! danger "Secure your endpoints"
    **Your application is responsible for securing its own endpoints.**

    - If a request does not contain an `Authorization` header, the request should be considered unauthenticated and access should be denied.
    - If a request has an `Authorization` header that contains a [JWT], the token must be validated before access is granted.

Your application should [validate the claims and signature](../concepts/tokens.md#token-validation)
for the JWT Bearer `access_token` attached by the sidecar in the `Authorization` header.

The `aud` (audience) claim must be equal to [your application's client ID](usage.md#azure_app_client_id) in Azure AD.

## Next Steps

The access token that Wonderwall provides should only be accepted and used by your application.

In order to access other applications, you should exchange the token in order to get a new token that is correctly scoped to access a given application.

For Azure AD, use the [on-behalf-of grant](../concepts/protocols.md#on-behalf-of-grant) to do this.

[JWT]: ../concepts/tokens.md#jwt

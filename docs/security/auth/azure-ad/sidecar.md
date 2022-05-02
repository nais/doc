---
description: Reverse-proxy that handles automatic authentication and login/logout flows for Azure AD.
---

# Azure AD sidecar

!!! warning "Status: Beta"
    This feature is only available in the [GCP clusters](../../../clusters/gcp.md).

    **Experimental**: this is a new feature. Use it in production, but be aware that bugs might arise.

    Report any issues to the #nais channel on Slack.

## Description

A reverse proxy that provides functionality to handle Azure AD login and logout.

!!! info "Prerequisites"
    - [x] Ensure that you first [enable Azure AD for your application](README.md).
    - [x] Ensure that you also define at least one [ingress](../../../nais-application/application.md#ingresses) for your application.

## Spec

!!! danger "Port Configuration"
    The sidecar will occupy and use the ports `7564` and `7565`.

    Ensure that you do **not** bind to these ports from your application as they will be overridden.

=== "nais.yaml"
    ```yaml
    spec:
      azure:
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

!!! danger
    **Your application should secure its own endpoints.** That is, deny access to sensitive endpoints if the appropriate authentication is not supplied.

Your application should also [validate the claims and signature](../concepts/tokens.md#token-validation) for the Azure AD JWT `access_token` attached by the sidecar.

The `aud` (audience) claim must be equal to [your application's client ID](usage.md#azure_app_client_id) in Azure AD.

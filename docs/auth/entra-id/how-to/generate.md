---
tags: [entra-id, azure-ad, how-to]
---

# Generate a token from Entra ID for development

This how-to guides you through the steps required to generate a token that you can use against an [API secured with Entra ID](secure.md) in the development environments.

## Prerequisites

1. You will need a [trygdeetaten.no user](../explanations/README.md#tenants) to access the service. Using the `nav.no` tenant is not supported.

## Grant access

[Grant access](secure.md#grant-access-to-consumers) to the token generator service:

```yaml title="app.yaml"
spec:
  azure:
    application:
      enabled: true
  accessPolicy:
    inbound:
      rules:
        - application: tokenx-token-generator
          namespace: aura
          cluster: dev-gcp
```

Ensure that the API application has configured the appropriate [user access policies](secure.md#users).

## Generate token

The Entra ID token generator supports two use cases:

### Generate token on behalf of employee user

1. Visit <https://azure-token-generator.intern.dev.nav.no/api/obo?aud=&lt;audience&gt;> in your browser.
    - Replace `<audience>` with the intended _audience_ of the token, in this case the API application.
    - The audience value must be on the form of `<cluster>:<namespace>:<application>`
    - For example: `dev-gcp:my-team:my-app`
1. You will be redirected to log in at Entra ID (if not already logged in).
1. After logging in, you should be redirected back to the token generator and presented with a JSON response containing an `access_token`.
1. Use the `access_token` as a [Bearer token](../../explanations/README.md#bearer-token) to consume the API application.

### Generate token for application user

1. Visit <https://azure-token-generator.intern.dev.nav.no/api/m2m?aud=&lt;audience&gt;> in your browser.
    - Replace `<audience>` with the intended _audience_ of the token, in this case the API application.
    - The audience value must be on the form of `<cluster>:<namespace>:<application>`
    - For example: `dev-gcp:my-team:my-app`
1. You will be redirected to log in at Entra ID (if not already logged in).
1. After logging in, you should be redirected back to the token generator and presented with a JSON response containing an `access_token`.
1. Use the `access_token` as a [Bearer token](../../explanations/README.md#bearer-token) to consume the API application.

---
tags: [tokenx, how-to]
---

# Generate a token for development

This how-to guides you through the steps required to generate a token that you can use against an [API secured with TokenX](secure.md) in the development environments.

## Grant access

[Grant access](secure.md#grant-access) to the token generator service:

```yaml title="app.yaml"
spec:
  tokenx:
    enabled: true
  accessPolicy:
    inbound:
      rules:
        - application: tokenx-token-generator
          namespace: aura
          cluster: dev-gcp
```

## Generate token

1. Visit <https://tokenx-token-generator.intern.dev.nav.no/api/obo?aud=&lt;audience&gt;> in your browser.
    - Replace `<audience>` with the intended _audience_ of the token, in this case the API application.
    - The audience value must be on the form of `<cluster>:<namespace>:<application>`
    - For example: `dev-gcp:my-team:my-app`
2. You will be redirected to log in at ID-porten (if not already logged in).
3. After logging in, you should be redirected back to the token generator and presented with a JSON response containing an `access_token`.
4. Use the `access_token` as a [Bearer token](../../explanations/README.md#bearer-token) for calls to your API application.

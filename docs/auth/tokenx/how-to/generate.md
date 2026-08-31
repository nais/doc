---
tags: [tokenx, how-to]
conditional: [tenant, nav]
---

# Generate a token from TokenX for development

This how-to guides you through the steps required to generate a token that you can use against an [API secured with TokenX](secure.md) in the development environments.

## Grant access

[Grant access](secure.md#grant-access-to-consumers) to the token generator service:

```yaml title="app.yaml"
spec:
  tokenx:
    enabled: true
  accessPolicy:
    inbound:
      rules:
        - application: tokenx-token-generator
          namespace: nais
          cluster: dev-gcp
```

## Generate token

### Generate a token interactively

This method requires user interaction with ID-porten to authenticate the end-user.

1. Visit <https://tokenx-token-generator.intern.dev.nav.no/api/obo?aud=&lt;audience&gt;> in your browser.
    - Replace `<audience>` with the intended _audience_ of the token, in this case the API application.
    - The audience value must be on the form of `<cluster>:<namespace>:<application>`
    - For example: `dev-gcp:my-team:my-app`
2. You will be redirected to log in at ID-porten (if not already logged in).
3. After logging in, you should be redirected back to the token generator and presented with a JSON response containing an `access_token`.
4. Use the `access_token` as a [Bearer token](../../explanations/README.md#bearer-token) to consume the API application.

### Generate a token headlessly

This method does not require user interaction, but also doesn't use ID-porten to obtain a user token.
If you want a production-like user token, you should instead use the interactive method above.

Perform a `POST` request to `https://tokenx-token-generator.intern.dev.nav.no/api/public/obo`:

```http
POST /api/public/obo?aud=<audience> HTTP/1.1
Host: tokenx-token-generator.intern.dev.nav.no
Content-Type: application/x-www-form-urlencoded

aud=<audience>
pid=<pid>
acr=idporten-loa-high    # optional, default shown
```

where

- `<audience>` is the intended _audience_ of the token, in this case the target API application
- `<pid>` is the personal identification number (PID) of the intended end-user. This value is not validated.
- `acr` (optional) is the [security level](../../idporten/reference/README.md#security-levels) for the user authentication

For example, in `curl`:

```bash
curl -s -X POST "https://tokenx-token-generator.intern.dev.nav.no/api/public/obo" \
  -d "aud=dev-gcp:my-team:my-app" \
  -d "pid=12345678901"
```

This returns an access token which can be used as a [Bearer token](../../explanations/README.md#bearer-token) to consume the target API application.

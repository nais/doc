---
tags: [idporten, how-to]
---

# Log in a citizen

This how-to guides you through the steps required to ensure that only citizens authenticated with [ID-porten](../README.md) can access your application. 

## Prerequisites

- Your application is [exposed to the appropriate audience](../../../workloads/application/how-to/expose.md).

## Configure your application

Enable the [login proxy](../../explanations/README.md#login-proxy) for ID-porten in your application configuration:

```yaml title="app.yaml"
spec:
  idporten:
    enabled: true
    sidecar:
      enabled: true
```

<<gcp_only("Login proxy")>>

See the [NAIS application reference](../../../workloads/application/reference/application-spec.md#idportensidecar) for the complete specifications with all possible options.

Now that your application is configured, you will need to handle inbound requests in your application code.

## Handle inbound requests

As long as the citizen is authenticated, the `Authorization` header includes their `access_token` as a [Bearer token](../../explanations/README.md#bearer-token).

Your application is responsible for verifying that this token is present and valid. To do so, follow these steps:

### Handle missing or empty `Authorization` header

If the `Authorization` header is missing or empty, the citizen is unauthenticated.

Return an appropriate HTTP status code to the frontend, and redirect the citizen's user agent to the [login endpoint]:

```
https://<ingress>/oauth2/login
```

### Validate token in `Authorization` header

If the `Authorization` header is present, validate the [JWT Bearer token](../../explanations/README.md#bearer-token) within.
If invalid, redirect the citizen to the [login endpoint]:

```
https://<ingress>/oauth2/login
```

{% include 'auth/partials/validate.md' %}

To validate the token, start by validating the [signature and standard time-related claims](../../explanations/README.md#token-validation).

Additionally, perform the following validations:

**Issuer Validation**

Validate that the `iss` claim has a value that is equal to either:

1. the `IDPORTEN_ISSUER` [environment variable](../reference/README.md#runtime-variables-credentials), or
2. the `issuer` property from the [metadata discovery document](../../explanations/README.md#well-known-url-metadata-document).
   The document is found at the endpoint pointed to by the `IDPORTEN_WELL_KNOWN_URL` environment variable.

**Audience Validation**

Validate that the `aud` claim is equal to the `IDPORTEN_AUDIENCE` environment variable.

**Signature Validation**

Validate that the token is signed with a public key published at the JWKS endpoint.
This endpoint URI can be found in one of two ways:

1. the `IDPORTEN_JWKS_URI` environment variable, or
2. the `jwks_uri` property from the metadata discovery document.
   The document is found at the endpoint pointed to by the `IDPORTEN_WELL_KNOWN_URL` environment variable.

**Claims Validation**

[Other claims](../reference/README.md#claims) may be present in the token. Validation of these claims is optional.

## Next steps

The citizen is now authenticated and can access your application.
However, the subject token found in the `Authorization` header is **only valid for _your_ application**.

To consume other APIs on behalf of the citizen, [exchange the token for a new token that targets a specific API](../../tokenx/how-to/consume.md).

## Related pages

:dart: Learn how to [consume other APIs on behalf of a citizen](../../tokenx/how-to/consume.md)

:books: [ID-porten reference](../reference/README.md)

:books: [Login proxy reference](../../reference/README.md#login-proxy)

[login endpoint]: ../../reference/README.md#login-endpoint

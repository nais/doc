---
tags: [idporten, how-to]
conditional: [tenant, nav]
---

# Log in a citizen

This how-to guides you through the steps required to ensure that only citizens authenticated with [ID-porten](../README.md) can access your application. 

## Prerequisites

Before you begin, ensure that you have:

- Familiarized yourselves with [the login proxy concepts](../../explanations/README.md#login-proxy).
- [Exposed your application with an ingress](../../../workloads/application/how-to/expose.md).

## Configure your application

Enable the login proxy for ID-porten in your application configuration:

```yaml title="app.yaml"
spec:
  idporten:
    enabled: true
    sidecar:
      enabled: true
```

<<gcp_only("Login proxy")>>

See the [Nais application reference](../../../workloads/application/reference/application-spec.md#idportensidecar) for the complete specifications with all possible options.

Now that your application is configured, you will need to handle inbound requests in your application code.

## Handle inbound requests

As long as the user is authenticated, all requests to your application at the server-side will include the `Authorization` header with the user's `access_token` as a [Bearer token](../../explanations/README.md#bearer-token).

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

{% set identity_provider = 'idporten' %}
{% set claims_reference = '../reference/README.md#claims' %}
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
You can extract [the claims](../reference/README.md#claims) from the subject token found in the `Authorization` header to assert the user's identity.

However, the token is **only valid for _your_ application**.
To consume other APIs on behalf of the citizen, [exchange the token for a new token that targets a specific API](../../tokenx/how-to/consume.md).

## Related pages

:dart: Learn how to [consume other APIs on behalf of a citizen](../../tokenx/how-to/consume.md)

:books: [ID-porten reference](../reference/README.md)

:books: [Login proxy reference](../../reference/README.md#login-proxy)

[login endpoint]: ../../reference/README.md#login-endpoint

---
tags: [entra-id, azure-ad, how-to]
conditional: [tenant, nav]
---

# Log in an employee

This how-to guides you through the steps required to ensure that only employees authenticated with [Entra ID](../README.md) can access your application.

## Prerequisites

- Your application is [exposed to the appropriate audience](../../../workloads/application/how-to/expose.md).

## Configure your application

Enable the [login proxy](../../explanations/README.md#login-proxy) for Entra ID in your application configuration:

```yaml title="app.yaml"
spec:
  azure:
    application:
      enabled: true
    sidecar:
      enabled: true
```

<<gcp_only("Login proxy")>>

See the [Nais application reference](../../../workloads/application/reference/application-spec.md#azuresidecar) for the complete specifications with all possible options.

### Grant access to users

{% include 'auth/entra-id/partials/user-access.md' %}

## Handle inbound requests

Now that your application is configured, you will need to handle inbound requests in your application code.
As long as the employee is authenticated, the `Authorization` header will include their `access_token` as a [Bearer token](../../explanations/README.md#bearer-token).

Your application is responsible for verifying that this token is present and valid. To do so, follow these steps:

### Handle missing or empty `Authorization` header

If the `Authorization` header is missing or empty, the employee is unauthenticated.

Return an appropriate HTTP status code to the frontend, and redirect the employee's user agent to the [login endpoint]:

```
https://<ingress>/oauth2/login
```

### Validate token in `Authorization` header

If the `Authorization` header is present, validate the [JWT Bearer token](../../explanations/README.md#bearer-token) within.
If invalid, redirect the employee to the [login endpoint]:

```
https://<ingress>/oauth2/login
```

{% include 'auth/entra-id/partials/validate.md' %}

## Next steps

The employee is now authenticated and can access your application.
You can extract [the claims](../reference/README.md#claims) from the subject token found in the `Authorization` header to assert the user's identity.

However, the token is **only valid for _your_ application**.
To consume other APIs on behalf of the employee, [exchange the token for a new token that targets a specific API](consume-obo.md).

## Related pages

:dart: Learn how to [consume other APIs on behalf of a employee](consume-obo.md)

:books: [Entra ID reference](../reference/README.md)

:books: [Login proxy reference](../../reference/README.md#login-proxy)

[login endpoint]: ../../reference/README.md#login-endpoint

---
tags: [entra-id, azure-ad, how-to]
---

# Log in an employee with Entra ID

{%- if tenant() == "nav" %}
!!! warning "Availability"

    This functionality is only available in the [Google Cloud Platform](../../../workloads/reference/environments.md#google-cloud-platform-gcp) environments.
{%- endif %}

This how-to guides you through the steps required to ensure that only employees authenticated with [Entra ID](../README.md) can access your application.

1. [Configure your application](#configure-your-application)
1. [Handle inbound requests](#handle-inbound-requests)

## Prerequisites

- Your application is [exposed to the appropriate audience](../../../workloads/application/how-to/expose.md).

## Configure your application

```yaml title="app.yaml"
spec:
  azure:
    application:
      enabled: true
    sidecar:
      enabled: true
```

See the [NAIS application reference](../../../workloads/application/reference/application-spec.md#azuresidecar) for the complete specifications with all possible options.

### Grant access to users

{% include 'auth/entra-id/partials/user-access.md' %}

Now that your application is configured, you will need to handle inbound requests in your application code.

## Handle inbound requests

As long as the employee is authenticated, the `Authorization` header includes their `access_token` as a [Bearer token](../../explanations/README.md#bearer-token).

Your application is responsible for verifying that this token is present and valid. To do so, follow these steps:

### Handle missing or empty `Authorization` header

If the `Authorization` header is missing or empty, the employee is unauthenticated.

Redirect the employee to the [login endpoint] provided by NAIS:

```
https://<ingress>/oauth2/login
```

### Validate token in `Authorization` header

If the `Authorization` header is present, validate the token.
If invalid, redirect the employee to the [login endpoint] provided by NAIS:

```
https://<ingress>/oauth2/login
```

{% include 'auth/entra-id/partials/validate.md' %}

## Related pages

:dart: Learn how to [consume other APIs on behalf of a employee](consume-obo.md)

:books: [Entra ID reference](../reference/README.md)

[login endpoint]: ../../reference/README.md#login-endpoint

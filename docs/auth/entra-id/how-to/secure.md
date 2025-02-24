---
tags: [entra-id, azure-ad, how-to]
conditional: [tenant, nav]
---

# Secure your API with Entra ID

This how-to guides you through the steps required to secure your API using [Entra ID](../README.md):

## Grant access to consumers

Depending on who your consumers are, you must grant access to either applications, users, or both.

### Applications

{% include 'auth/entra-id/partials/app-access.md' %}

### Users

{% include 'auth/entra-id/partials/user-access.md' %}

---

Now that you have granted access to your consumers, they can now acquire tokens that target your application, either:

- [on behalf of an employee](consume-obo.md), or
- [as an application](consume-m2m.md)

You will need to validate these tokens in your application.

## Validate tokens

Verify incoming requests from consumers by validating the [JWT Bearer token](../../explanations/README.md#bearer-token) in the `Authorization` header.

{% include 'auth/entra-id/partials/validate.md' %}

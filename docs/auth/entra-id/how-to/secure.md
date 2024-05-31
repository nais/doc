---
tags: [entra-id, azure-ad, how-to]
---

# Secure your API with Entra ID

This how-to guides you through the steps required to secure your API using [Entra ID](../README.md):

1. [Grant access to your consumers](#grant-access-to-consumers)
1. [Validate tokens in requests from consumers](#validate-tokens)

{%- if tenant() == "nav" %}
???+ warning "Use webproxy for outbound network connectivity from on-premises environments"

    If you're on-premises, you must enable and use [`webproxy`](../../../workloads/application/reference/application-spec.md#webproxy) to access Entra ID.

{%- endif %}

## Grant access to consumers

Depending on who your consumers are, you must grant access to either applications, users, or both.

### Applications

{% include 'auth/entra-id/partials/app-access.md' %}

### Users

{% include 'auth/entra-id/partials/user-access.md' %}

Now that you have granted access to your consumers, they can now acquire tokens that target your application, either:

- [on behalf of an employee](consume-obo.md), or
- [as an application](consume-m2m.md)

You will need to validate these tokens in your application.

## Validate tokens

{% include 'auth/entra-id/partials/validate.md' %}

[variables-ref]: ../reference/README.md#variables-for-validating-tokens

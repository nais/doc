---
tags: [auth, idporten, services, explanation]
---

# ID-porten

{%- if tenant() == "nav" %}
!!! warning "Availability"

    This functionality is only available in the [Google Cloud Platform](../../workloads/reference/environments.md#google-cloud-platform-gcp) environments.
{%- endif %}

[ID-porten](https://docs.digdir.no/docs/idporten/) is the standard authentication service used by Norwegian citizens to access public services.

If you have a citizen-facing application that requires authentication, you will need to integrate with ID-porten.
NAIS simplifies this by providing a [login proxy](../explanations/README.md#login-proxy) with endpoints to easily handle login, logout, and user sessions.

Your application is left with the responsibility to verify that inbound requests have valid tokens.

:dart: Learn how to [log in citizens with ID-porten](how-to/login.md).

---
tags: [auth, sidecar, services]
---

# ID-porten

{%- if tenant() == "nav" %}
!!! warning "Availability"

    This functionality is only available in the [Google Cloud Platform](../../workloads/reference/environments.md#google-cloud-platform-gcp) environments.
{%- endif %}

[ID-porten](https://docs.digdir.no/docs/idporten/) is the standard authentication service used by Norwegian citizens to access public services.

If you have a citizen-facing application that requires authentication, you will need to integrate with ID-porten.

NAIS simplifies this by providing:

- :books: [A login endpoint](reference/README.md#logout-endpoint) that handles the authentication flow with ID-porten
- :books: [A logout endpoint](reference/README.md#logout-endpoint) that triggers single-logout with ID-porten
- :books: [Session management](../../security/auth/wonderwall.md#5-sessions)

Your application is left with the responsibility to verify that inbound requests have valid tokens.

:dart: Learn how to [secure your application with ID-porten](how-to/secure.md).

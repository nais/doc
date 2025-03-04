---
tags: [auth, idporten, services, explanation]
conditional: [tenant, nav]
---

# ID-porten

<<gcp_only("ID-porten")>>

[ID-porten](https://docs.digdir.no/docs/idporten/) is the standard authentication service used by Norwegian citizens to access public services.

If you have a citizen-facing application that requires authentication, you will need to integrate with ID-porten.
Nais simplifies this by providing a [login proxy](../explanations/README.md#login-proxy) with endpoints to easily handle login, logout, and user sessions.

Your application is responsible for verifying that inbound requests have valid [tokens](../explanations/README.md#tokens).

:dart: [**Learn how to log in citizens**](how-to/login.md)

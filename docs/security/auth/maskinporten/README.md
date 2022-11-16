---
description: >
  Enabling service-to-service authentication with external agencies using Maskinporten.
---

# Maskinporten

!!! warning "Limited Availability"
    This feature is only available in [team namespaces](../../../clusters/team-namespaces.md)


[Maskinporten](https://docs.digdir.no/maskinporten_overordnet.html) is a service provided by DigDir that allows API providers to securely enforce server-to-server authorization of their exposed APIs using OAuth 2.0 JWT grants.

The NAIS platform provides support for declarative registration of Maskinporten resources. These cover two distinct use cases:

* [For API consumers](client.md)
    * a _client_ that your application may use to integrate with Maskinporten, and in turn consume services and APIs served by external agencies
* [For API providers](scopes.md)
    * user-defined _scopes_ within Maskinporten that are exposed to and consumable by other organizations that are granted access.


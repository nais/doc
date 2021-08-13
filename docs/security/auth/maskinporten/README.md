---
description: >
  Enabling service-to-service authentication with external agencies using Maskinporten.
---

# Maskinporten

!!! warning "Status: Opt-In Open Beta"
    This feature is only available in [team namespaces](../../../clusters/team-namespaces.md)

## Abstract

!!! abstract
    [Maskinporten](https://docs.digdir.no/maskinporten_overordnet.html) is a service provided by DigDir that allows API providers - in this case, external agencies - 
    to securely enforce [server-to-server authorization of their exposed APIs using OAuth 2.0 JWT grants](https://docs.digdir.no/maskinporten_auth_server-to-server-oauth2.html). 
    It allows API providers to model access policies by using scopes based on the organization numbers of the consumers.

    The NAIS platform provides support for declarative registration of Maskinporten resources. These cover two distinct use cases:

    [For API consumers](https://docs.digdir.no/maskinporten_guide_apikonsument.html):
    - a _client_ that your application may use to integrate with Maskinporten, and in turn consume services and APIs served by external agencies

    [For API providers](https://docs.digdir.no/maskinporten_guide_apitilbyder.html):
    - user-defined _scopes_ within Maskinporten that are exposed to and consumable by other organizations that are granted access.

## Client

If you want to _consume_ an external API, you'll need a [client](client.md).

## Scopes

If you want to _expose_ an API to external consumsers, you'll need to define [scopes](scopes.md).

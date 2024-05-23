---
tags: [auth, maskinporten, services]
description: >
  Enabling service-to-service authorization between organizations and businesses using Maskinporten.
---

# Maskinporten Overview

[Maskinporten](https://docs.digdir.no/maskinporten_overordnet.html) is a service provided by DigDir used to authorize access to APIs between organizations or businesses.

NAIS provides support for declarative registration and configuration of Maskinporten resources.
These cover two distinct use cases:

## Consume an API

To consume an external API secured with Maskinporten, you'll need to acquire a [token](../explanations/README.md#tokens):

```mermaid
graph LR
  Consumer["Application"] --1. request token---> Maskinporten
  Maskinporten --2. return token---> Consumer
  Consumer --3. use token---> API["External API"]
```

:dart: Learn how to [consume an external API using Maskinporten](how-to/consume.md)

## Secure your API

To secure your API with Maskinporten, you'll need to define _permissions_ (also known as _scopes_) and grant consumers access to these.

Once configured, your consumers can acquire a token from Maskinporten to [consume your API](#consume-an-api).

Your application code must verify inbound requests by validating the included tokens.

:dart: Learn how to [secure your API using Maskinporten](how-to/secure.md)

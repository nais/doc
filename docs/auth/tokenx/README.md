---
tags: [auth, tokenx, services, explanation]
---

# TokenX

TokenX is NAIS' own implementation of OAuth 2.0 Token Exchange.

This allows internal applications to act on behalf of a citizen that originally authenticated with [ID-porten](../idporten/README.md),
while maintaining the [zero trust](../../workloads/explanations/zero-trust.md) security model between applications throughout a request chain.

NAIS provides support for declarative registration and configuration of TokenX resources.
These cover two distinct use cases:

## Consume an API

To consume an API secured with TokenX on behalf of a citizen, you'll need to exchange the inbound [token](../explanations/README.md#tokens) for a new token.

The new token preserves the citizen's identity context and is only valid for the specific API you want to access.

```mermaid
graph LR
  Consumer -->|1. citizen token| A
  A["Your API"] -->|2. exchange token| TokenX
  TokenX -->|3. new token for Other API| A
  A -->|4. use token| O[Other API]
```

:dart: Learn how to [consume an API using TokenX](how-to/consume.md)

## Secure your API

To secure your API with TokenX, you'll need to grant consumers access to your application.

Once configured, your consumers can exchange a token with TokenX to [consume your API](#consume-an-api).

Your application code must verify inbound requests by validating the included tokens.

:dart: Learn how to [secure your API using TokenX](how-to/secure.md)

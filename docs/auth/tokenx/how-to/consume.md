---
tags: [tokenx, how-to]
conditional: [tenant, nav]
---

# Consume internal API on behalf of a citizen

This how-to guides you through the steps required to consume an API secured with [TokenX](../README.md):

## Prerequisites

- Your application receives requests with a citizen subject token in the `Authorization` header
    - The subject token can either be from [ID-porten](../../idporten/README.md) or from TokenX itself
- The API you're consuming has [granted access to your application](secure.md#grant-access-to-consumers)

## Configure your application

Enable TokenX in your application:

```yaml title="app.yaml"
spec:
  tokenx:
    enabled: true
```

Depending on how you communicate with the API you're consuming, [configure the appropriate outbound access policies](../../../workloads/how-to/access-policies.md#outbound-access).

## Exchange token

{% set identity_provider = 'tokenx' %}
{% set target = '<cluster>:<namespace>:<other-app-name>' %}
{% include 'auth/partials/token-exchange.md' %}

## Consume API

Once you have acquired a new token, you can finally consume the target API by using the token as a [Bearer token](../../explanations/README.md#bearer-token):

```http
GET /resource HTTP/1.1

Host: api.example.com
Authorization: Bearer eyJraWQ...
```

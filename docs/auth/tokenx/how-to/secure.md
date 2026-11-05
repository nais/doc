---
tags: [tokenx, how-to]
conditional: [tenant, nav]
---

# Secure your API with TokenX

This how-to guides you through the steps required to secure your API using [TokenX](../README.md):

## Grant access to consumers

Specify inbound access policies to authorize your consumers.
Use `namespace` for the consumer's team name and `cluster` for its environment:

```yaml title="app.yaml"
spec:
  tokenx:
    enabled: true
  accessPolicy:
    inbound:
      rules:
        - application: app-1  # same team and environment

        - application: app-2  # same environment
          namespace: team-a

        - application: app-3
          namespace: team-b
          cluster: prod-gcp
```

The above configuration authorizes the following applications:

* application `app-1` in your team and environment
* application `app-2` in `team-a` in your environment
* application `app-3` in `team-b` in `prod-gcp`

Now that you have granted access to your consumers, they can now exchange tokens for new tokens that target your application.
You will need to validate these tokens in your application.

## Validate tokens

Verify incoming requests from consumers by validating the [JWT Bearer token](../../explanations/README.md#bearer-token) in the `Authorization` header.

{% set identity_provider = 'tokenx' %}
{% set claims_reference = '../reference/README.md#claims' %}
{% set token_validation_reference = '../reference/README.md#manual-token-validation' %}
{% include 'auth/partials/validate.md' %}

---
tags: [tokenx, how-to]
conditional: [tenant, nav]
---

# Secure your API with TokenX

This how-to guides you through the steps required to secure your API using [TokenX](../README.md):

## Grant access to consumers

Specify inbound access policies to authorize your consumers:

```yaml title="app.yaml"
spec:
  tokenx:
    enabled: true
  accessPolicy:
    inbound:
      rules:
        - application: app-1  # same namespace and cluster

        - application: app-2  # same cluster
          namespace: team-a

        - application: app-3
          namespace: team-b
          cluster: prod-gcp
```

The above configuration authorizes the following applications:

* application `app-1` running in the same namespace and same cluster as your application
* application `app-2` running in the namespace `team-a` in the same cluster
* application `app-3` running in the namespace `team-b` in the cluster `prod-gcp`

Now that you have granted access to your consumers, they can now exchange tokens for new tokens that target your application.
You will need to validate these tokens in your application.

## Validate tokens

Verify incoming requests from consumers by validating the [JWT Bearer token](../../explanations/README.md#bearer-token) in the `Authorization` header.

{% set identity_provider = 'tokenx' %}
{% set claims_reference = '../reference/README.md#claims' %}
{% set token_validation_reference = '../reference/README.md#manual-token-validation' %}
{% include 'auth/partials/validate.md' %}

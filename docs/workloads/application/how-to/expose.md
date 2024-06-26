---
tags: [application, how-to, ingress]
---

# Expose an application

This guide will show you how to [expose your application to the correct audience](../explanations/expose.md) by using an ingress.

## Select audience

Select the correct audience from the available [domains in your environment](../../reference/environments.md).

## Define ingress

Specify the desired hostname for your application in the application manifest with [`.spec.ingresses[]`](../reference/application-spec.md#ingresses):

```yaml hl_lines="4-5" title=".nais/app.yaml"
apiVersion: nais.io/v1alpha1
kind: Application
spec:
  ingresses:
    - https://<MY-SUBDOMAIN>.<ENVIRONMENT-DOMAIN>
```

!!! tip "Specific paths"

    You can optionally specify a path for each individual ingress to only expose a subset of your application.

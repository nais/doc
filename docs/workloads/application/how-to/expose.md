---
tags: [application, how-to, ingress]
---

# Expose an application

This guide will show you how to [expose your application](../explanations/expose.md) to end-users or applications in other environments by using an ingress.

If your application only needs to be available to other applications running in the same environment, you should use [service discovery](../explanations/expose.md#service-discovery) instead.

## Select audience

Select the correct audience from [the available domains in your environment](../../reference/environments.md).

## Define ingress

Specify the desired hostname for your application in the application manifest with [`.spec.ingresses[]`](../reference/application-spec.md#ingresses):

```yaml hl_lines="4-5" title=".nais/app.yaml"
apiVersion: nais.io/v1alpha1
kind: Application
spec:
  ingresses:
    - https://<MY-SUBDOMAIN>.<ENVIRONMENT-DOMAIN>
```

!!! warning "Subdomain restrictions"

    Subdomains must only contain lowercase letters, numbers, and hyphens.
    They may not start or end with a hyphen.

    Only one level of subdomains is allowed, e.g.:

    - `<MY-SUBDOMAIN>.<ENVIRONMENT-DOMAIN>` is allowed
    - `<MY-SUBSUBDOMAIN>.<MY-SUBDOMAIN>.<ENVIRONMENT-DOMAIN>` is not allowed

## Optional: Specify path for ingress

An ingress may include a path to expose a subset of your application:

```yaml hl_lines="4-5" title=".nais/app.yaml"
apiVersion: nais.io/v1alpha1
kind: Application
spec:
  ingresses:
    - https://<MY-SUBDOMAIN>.<ENVIRONMENT-DOMAIN>/some-path
```

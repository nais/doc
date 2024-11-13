---
tags: [ application, how-to, redirect ]
---

# Redirect a client

To redirect traffic from one domain to another, you need to define an ingress for the old domain that redirects to the
new domain, with [`.spec.redirects[]`](../reference/application-spec.md#redirects).

The `redirects` field specifies URL redirects. It is structured as a mapping from a source URL to a target URL.

A successful redirect will return a `302 Moved Temporarily` HTTP status code with location header set to the target URL.

!!! note "Status code"
    The status code can not be overridden. 

### Structure

```yaml hl_lines="4-5" title=".nais/app.yaml"
apiVersion: nais.io/v1alpha1
kind: Application
spec:
  ingress:
    - https://<MY-SUBDOMAIN-OLD>.<ENVIRONMENT-DOMAIN>
  redirects:
    - from: https://<MY-SUBDOMAIN-OLD>.<ENVIRONMENT-DOMAIN>
      to: https://<MY-SUBDOMAIN>.<ENVIRONMENT-DOMAIN>
```

### Parameters

- **from**: *(string)* The source URL to be redirected. This is the URL where requests originate.
- **to**: *(string)* The target URL for the redirection. This is the URL where requests will be forwarded.

### Usage Example

```yaml hl_lines="4-5" title=".nais/app.yaml"
apiVersion: nais.io/v1alpha1
kind: Application
spec:
  ingress:
    - https://example-old.com
  redirects:
    - from: "http://example-old.nais.io"
      to: "http://example.nais.io"
```

!!! warning "Redirect restrictions"

    The `from` and `to` URLs must be valid URLs.
    The `from` URL must be a valid URL that is exposed by the application.

In this example:

- Requests to `http://example-old.nais.io` are redirected to `http://example.nais.io`. 
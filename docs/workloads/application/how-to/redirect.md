---
tags: [ application, how-to, redirect ]
---

# Redirect a client

To redirect traffic from one domain to another, you need to define an ingress `from` the old domain that redirects `to` the
new domain, with [`.spec.redirects[]`](../reference/application-spec.md#redirects).

The `redirects` field specifies URL redirects. It is structured as a mapping from a source URL to a target URL.

A successful redirect will return a `302 Moved Temporarily` HTTP status code with location header set to the target URL.

??? note "Status code for redirects"
    The status code can not be overridden. 

### Structure

```yaml hl_lines="4-5" title=".nais/app.yaml"
apiVersion: nais.io/v1alpha1
kind: Application
spec:
  ingress:
    - https://<MY-SUBDOMAIN-NEW>.<ENVIRONMENT-DOMAIN>
  redirects:
    - from: https://<MY-SUBDOMAIN-OLD>.<ENVIRONMENT-DOMAIN>
      to: https://<MY-SUBDOMAIN-NEW>.<ENVIRONMENT-DOMAIN>
```

### Parameters

- **from**: *(string)* The source URL for the redirection. This is the URL that will be redirected. 
- **to**: *(string)* The target URL for the redirection. This is the URL that the client will be redirected to. 

### Usage Example

```yaml hl_lines="4-5" title=".nais/app.yaml"
apiVersion: nais.io/v1alpha1
kind: Application
spec:
  ingress:
    - http://example-new.nais.io
  redirects:
    - from: "http://example-old.nais.io"
      to: "http://example-new.nais.io"
```

??? warning "Redirect restrictions"

    The `from` and `to` URLs must be valid URLs.
    The `to` URL must be a valid URL that is exposed by the application.

In this example:

- Requests to `http://example-old.nais.io` are redirected to `http://example-new.nais.io`. 
---
tags: [ application, how-to, redirect ]
---

# Redirect a client

The Nais platform support two ways to [exposing your application](../explanations/expose.md), either via an Ingress resource, or through service discovery.
This means that we also support two ways to redirect your application.

- [Ingress](#ingress)
- [Service discovery](#service-discovery)

## Ingress

To redirect traffic from one domain to another, you need to define an ingress `from` the old domain that redirects `to` the
new domain, with [`.spec.redirects[]`](../reference/application-spec.md#redirects).

The `redirects` field specifies URL redirects. It is structured as a mapping from a source URL to a target URL.

A successful redirect will return a `302 Moved Temporarily` HTTP status code with location header set to the target URL. 

- The status code can not be overridden.
- The `from` and `to` URLs must be valid URLs.
- The `to` URL must be a valid URL that is exposed by the application.

!!! info "Explicit redirect permission"
	If the redirection is between two teams/namespaces, the following annotation needs to be set on the old Nais application
    ```yaml
    metadata:
        annotations:
            nais.io/allow-redirect: "true"
    ```

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

In this example:

- Requests to `http://example-old.nais.io` are redirected to `http://example-new.nais.io`.

## Service discovery

To redirect traffic coming through service discovery you need to create a service in the old namespace pointing to the new app/service in the new namespace.
This is not a part of the Nais application specification, so you need to create and deploy a separate file for this.

!!! info "Access policy"

    Remember that access policy is traffic between _pods_, so if you redirect the traffic to a different namespace, the client needs to update their access policy to use the new namespace.

### Structure

```yaml hl_lines="4-5 10" title=".nais/service.yaml"
apiVersion: v1
kind: Service
metadata:
  name: old-appname-redirect # Replace
  namespace: old-namespace # Replace
spec:
  type: ExternalName
  ports:
    - port: 443
  externalName: old-appname.old-namespace.svc.cluster.local # Replace
```

Deploy either through Github Actions, or using `kubectl apply -f .nais/service.yaml`.

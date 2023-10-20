---
description: API Gateway for securing your APIs
---

# API Gateway - KrakenD

!!! info "Status: Beta"
    This feature is only in a beta.

    **Experimental**: this feature is in its early stages and awaits user feedback - breaking changes may be introduced in the future.

    Please report any issues and feedback to the #eksponere-eksterne-apier-fra-gcp or #nais channel on Slack.

## What is KrakenD

[KrakenD](https://www.krakend.io/) is an open-source API Gateway that sits in front of your APIs and provides a single point of entry for API clients.

## KrakenD in NAIS

KrakendD in NAIS is meant as an extra feature for teams using [Maskinporten](../auth/maskinporten) to expose their APIs to external consumers/partners.

Each team can get their own instance of KrakenD deployed in their namespace. The KrakenD instance will be configured to require Maskinporten tokens, and API endpoints can be added
in a declarative manner using the [ApiEndpoints custom resource](https://github.com/nais/krakend/blob/main/config/samples/apiendpoints_max.yaml)

The KrakenD instances and config for exposing APIs are managed by the [krakend-operator](https://github.com/nais/krakend).

### Usage

To get KrakenD installed in your namespace - the namespace must have a label `krakend.nais.io/enabled: "true"`. If you do not have permissions to add this label, please contact the NAIS team and we will add it for you.

After beta testing, we will add more automation to this process.

When KrakenD is installed in your namespace you will get an ingress for your KrakenD instance at:

* GCP: `https://<namespace>-gw.ekstern.dev.nav.no` and `https://<namespace>-gw.nav.no`
* On-prem: `https://<namespace>-gw.dev-fss-pub.nais.io` and `https://<namespace>-gw.prod-fss-pub.nais.io`

!!! info "Note for on-prem"
    You have to add the KrakenD ingress for your namespace to https://github.com/navikt/bigip-iac/ in order to reach your KrakenD instance from GCP.
   
    Also see [Use Cases](#Use cases) below for more details on how to expose your API to external consumers from on-prem via GCP.
    If you already have a special "pub" ingress for your app and you do maskintoken validation already you can expose that directly to KrakenD in GCP instead.

You can then add API endpoints to your KrakenD instance by creating one or more `ApiEndpoints` custom resources in your namespace.

#### Adding API endpoints

To add API endpoints to your KrakenD instance, you need to create an `ApiEndpoints` custom resource in your namespace.

The `ApiEndpoints` resource splits the configuration of an app's API endpoints into two parts:

* `endpoints` - secure API endpoints requiring authentication
* `openEndpoints` - open API endpoints not requiring authentication, .e.g. documentation or OpenAPI specs

Currently we support the following KrakenD features:
* [JWT validation](https://www.krakend.io/docs/authorization/jwt-validation/): authentication for a secured endpoint is defined by specifying the name of an authentication provider - in nais this is `maskinporten`.
* [Rate-limiting](https://www.krakend.io/docs/endpoints/rate-limit/): if rate-limiting is defined it is applied to all `endpoints` and `openEndpoints` defined in the `ApiEndpoints` resource.


=== "apiendpoints.yaml"
```yaml
apiVersion: krakend.nais.io/v1
kind: ApiEndpoints
metadata:
  name: app1
spec:
  appName: app1
  auth:
    name: maskinporten
    cache: true
    debug: true
    scope:
      - "nav:some/other/scope"
  rateLimit:                      # optionally specify rate-limiting for your app, see https://www.krakend.io/docs/endpoints/rate-limit/#configuration for details
    maxRate: 10                   
    clientMaxRate: 0
    strategy: ip
    capacity: 0
    clientCapacity: 0
  endpoints:                      # specify your API endpoints requiring auth here
    - path: /app1/somepath        # path for your API endpoint in KrakenD - must be unique within your namespace
      method: GET
      forwardHeaders:             # if your backend validates tokens, you need to forward the Authorization header
        - Authorization
      queryParams:                # if your api uses query params, you need to specify the names here
        - foo
        - bar
      backendHost: http://app1    # the service url or ingress for your app
      backendPath: /api/somepath  # the path to your API endpoint in your app
  openEndpoints:                  # specify your open API endpoints here
    - path: /app1/doc
      method: GET
      backendHost: http://app1
      backendPath: /doc
```

!!! info "KrakenD requirements on paths, query params and headers"
    There are some strict requirements on specifying paths, query params and headers in KrakenD, see the [ApiEndpoints CRD](./config/crd/bases/krakend.nais.io_apiendpoints.yaml) and corresponding [Krakend Doc](https://www.krakend.io/docs/endpoints/) for details.


## Use cases

### Expose an API to external consumers from GCP

Enable KrakenD in your namespace in GCP and add API endpoints to your KrakenD instance.

### Expose an API to external consumers from on-prem via GCP

If your app already have a special "pub" ingress, ref [explanation here](https://doc.nais.io/clusters/migrating-to-gcp/#how-do-i-reach-an-application-found-on-premises-from-my-application-in-gcp), 
you can enable KrakenD in your namespace in GCP and add API endpoints to your KrakenD instance there, i.e. point to your pub ingress.

=== apiendpoints-gcp.yaml
```yaml
  apiVersion: krakend.nais.io/v1
  kind: ApiEndpoints
  metadata:
    name: gcp-app1
  spec:
    appName: does-not-matter
    auth:
      name: maskinporten
      cache: true
      debug: true
      scope:
        - "nav:some/other/scope"
    endpoints:                      # specify your API endpoints requiring auth here
      - path: /app1/somepath        # path for your API endpoint in KrakenD - must be unique within your namespace
        method: GET
        forwardHeaders:             # if your backend validates tokens, you need to forward the Authorization header
          - Authorization
        backendHost: https://app1.dev-fss-pub.nais.io    
        backendPath: /api/somepath  # the path to your API endpoint in your app
```

### Expose a legacy API to external consumers from on-prem via GCP

If you have a legacy app on-prem without a special "pub" ingress you must enable KrakenD both in your namespace on-prem and gcp.
ApiEndpoints must then be added in both clusters, but with different backendHosts. There will be token validation in both clusters.



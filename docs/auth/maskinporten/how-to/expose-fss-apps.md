---
tags: [how-to, maskinporten]
conditional: [tenant, nav]
---
# Expose FSS apps with KrakenD

!!! warning "FSS apps only"

    KrakendD in Nais is meant as an extra feature for teams using [Maskinporten](../README.md) to expose their APIs on-prem (FSS / Fagsystemsonen) to external consumers/partners.
    Applications that run in GCP should use the [Maskinporten](../README.md) functionality directly.

!!! info "Status: Beta"
    This feature is only in a beta.

    **Experimental**: this feature is in its early stages and awaits user feedback - breaking changes may be introduced in the future.

    Please report any issues and feedback to the #eksponere-eksterne-apier-fra-gcp or #nais channel on Slack.

## What is KrakenD

[KrakenD](https://www.krakend.io/) is an open-source API Gateway that sits in front of your Maskinporten APIs and provides a single point of entry for API clients.

## KrakenD in Nais

Each team can get their own instance of KrakenD deployed in their namespace. The KrakenD instance will be configured to require JWT tokens, and API endpoints can be added
in a declarative manner using the [ApiEndpoints custom resource](https://github.com/nais/krakend/blob/main/config/samples/apiendpoints_max.yaml)

The KrakenD instances and config for exposing APIs are managed by the [krakend-operator](https://github.com/nais/krakend).

## Usage

To get KrakenD installed in your namespace - the namespace must have a label `krakend.nais.io/enabled: "true"`.

If you do not have permissions to add this label, please contact the Nais team and we will add it for you.
After beta testing, we will add more automation to this process.

When KrakenD is installed in your namespace you will get an ingress for your KrakenD instance at:

GCP:

* `https://<MY-TEAM>-gw.ekstern.dev.nav.no`
* `https://<MY-TEAM>-gw.nav.no`

On-prem:

* `https://<MY-TEAM>-gw.dev-fss-pub.nais.io`
* `https://<MY-TEAM>-gw.prod-fss-pub.nais.io`

!!! info "Note for on-prem"

    See [Use Cases](#use-cases) below for more details on how to expose your API to external consumers from on-prem via GCP.
    If you already have a special "pub" ingress for your app and you do maskintoken validation already you can expose that directly to KrakenD in GCP instead.

You can then add API endpoints to your KrakenD instance by creating one or more `ApiEndpoints` custom resources in your namespace.

### Adding API endpoints

To add API endpoints to your KrakenD instance, you need to create an `ApiEndpoints` custom resource in your namespace.

The `ApiEndpoints` resource splits the configuration of an app's API endpoints into two parts:

* `endpoints` - secure API endpoints requiring authentication
* `openEndpoints` - open API endpoints not requiring authentication, e.g. documentation or OpenAPI specs

Currently we support the following KrakenD features:

* [JWT validation](https://www.krakend.io/docs/authorization/jwt-validation/)
* [Rate-limiting](https://www.krakend.io/docs/endpoints/rate-limit/): if rate-limiting is defined it is applied to all `endpoints` and `openEndpoints` defined in the `ApiEndpoints` resource

```yaml title="apiendpoints.yaml"
apiVersion: krakend.nais.io/v1
kind: ApiEndpoints
metadata:
  name: app1
spec:
  appName: app1
  auth:
    name: maskinporten
    cache: true
    scopes:                        # specify the scopes or audience your app requires here, by using the keys audience or scope. can also be omitted
      - "nav:some/other/scope"
  rateLimit:                      # optionally specify rate-limiting for your app, see https://www.krakend.io/docs/endpoints/rate-limit/#configuration for details
    maxRate: 10
    clientMaxRate: 0
    every: 1s
    strategy: ip
    capacity: 0
    clientCapacity: 0
  endpoints:                      # specify your API endpoints requiring auth here
    - path: /app1/somepath        # path for your API endpoint in KrakenD - must be unique within your namespace
      method: GET
      timeout: 5s                 # optionally specify a timeout for the entire roundtrip to your backend, see https://www.krakend.io/docs/endpoints/#timeout
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
    There are some strict requirements on specifying paths, query params and headers in KrakenD, see the [ApiEndpoints CRD](https://github.com/nais/krakend/blob/main/config/crd/bases/krakend.nais.io_apiendpoints.yaml) and corresponding [Krakend Doc](https://www.krakend.io/docs/endpoints/) for details.

### Monitoring and Logging

#### Logs

KrakenD logs are available in Grafana Loki. You can access these logs by querying for your team's namespace and the KrakenD service:

```logql
{service_namespace="your-team-namespace", service_name="krakend"}
```

This allows you to monitor API requests, debug issues, and track the behavior of your KrakenD gateway.

#### Metrics

KrakenD also exposes Prometheus metrics that you can use to monitor the performance and health of your API gateway. Here are some of the most useful metrics:

**Server metrics** (API gateway performance):

* `krakend_opencensus_io_http_server_latency_bucket`: Histogram showing the full request latency distribution
* `krakend_opencensus_io_http_server_request_count`: Total count of requests received by KrakenD
* `krakend_opencensus_io_http_server_request_count_by_method`: Total requests broken down by HTTP method
* `krakend_opencensus_io_http_server_response_count_by_status_code`: Total responses broken down by status code

**Backend/client metrics** (downstream service performance):

* `krakend_opencensus_io_http_client_completed_count`: Count of completed requests to your backend services
* `krakend_opencensus_io_http_client_roundtrip_latency_bucket`: Histogram showing the latency distribution for backend requests

You can use these metrics to create Grafana dashboards to monitor:

* Gateway throughput and request rates
* Response status code distribution (success vs errors)
* Request latency at both gateway and backend levels
* Data transfer volume with sent/received bytes metrics

These metrics are automatically collected and can be queried in Prometheus.

## Use cases

### Expose an API to external consumers from on-prem via GCP

If your app already have a special "pub" ingress, ref [explanation here](../../../workloads/explanations/migrating-to-gcp.md#how-do-i-reach-an-application-found-on-premises-from-my-application-in-gcp),
you can enable KrakenD in your namespace in GCP and add API endpoints to your KrakenD instance there, i.e. point to your pub ingress.

=== "Maskinporten"
    ```yaml title="apiendpoints.yaml"
      apiVersion: krakend.nais.io/v1
      kind: ApiEndpoints
      metadata:
        name: gcp-app1
      spec:
        appName: does-not-matter
        auth:
          name: maskinporten
          cache: true
          scopes:
            - "nav:some/other/scope"
        endpoints:                      # specify your API endpoints requiring auth here
          - path: /app1/somepath        # path for your API endpoint in KrakenD - must be unique within your namespace
            method: GET
            timeout: 5s                 # optionally specify a timeout for the entire roundtrip to your backend, see https://www.krakend.io/docs/endpoints/#timeout
            forwardHeaders:             # if your backend validates tokens, you need to forward the Authorization header
              - Authorization
            backendHost: https://app1.dev-fss-pub.nais.io
            backendPath: /api/somepath  # the path to your API endpoint in your app
    ```

=== "AzureAD"
    ```yaml title="apiendpoints.yaml"
      apiVersion: krakend.nais.io/v1
      kind: ApiEndpoints
      metadata:
        name: gcp-app1
      spec:
        appName: does-not-matter
        auth:
          name: azuread
          cache: true
          audience:
            - "the_value_of_aud"
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

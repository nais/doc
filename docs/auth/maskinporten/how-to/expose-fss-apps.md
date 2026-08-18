---
tags: [how-to, maskinporten]
conditional: [tenant, nav]
---
# Expose FSS apps with KrakenD

!!! warning "Status: Deprecated"
    This feature is now deprecated. The krakend-operator will no longer be maintained, and will be removed soon.

    This means you can no longer add new API endpoints to your KrakenD instance unless you convert it to a standalone Nais application.
    Existing endpoints will continue to work, but we recommend migrating using the steps below or implementing Maskinporten validation directly in your application.

    KrakenD in Nais is meant as an extra feature for teams using [Maskinporten](../README.md) to expose their on-prem APIs (FSS / Fagsystemsonen) to external consumers and partners.
    Applications that run in GCP should use the [Maskinporten](../README.md) functionality directly.

## What is KrakenD

[KrakenD](https://www.krakend.io/) is an open-source API Gateway that sits in front of your Maskinporten APIs and provides a single point of entry for API clients.

## KrakenD on Nais

If you want to use KrakenD on Nais, you can deploy it as a standalone application in your namespace. If you already have KrakenD deployed in your namespace using the custom resources `Krakend` and `ApiEndpoints`, you must convert it to a standalone application by following the steps below:

### Why migrate?

Running KrakenD as a standalone application gives you more control and access to the same tooling as any other Nais app:

* **Full control** over your own KrakenD instances.
* **Update on your own schedule**, and adopt new KrakenD functionality whenever it suits you.
* KrakenD is treated like any other application, so you get the benefits of the tooling built for apps, such as vulnerability overview, cost and issue tracking through [Nais Console](<<tenant_url("console")>>).

### Migrating from the Krakend operator to a standalone application

We have created a tool to help you migrate from the Krakend operator to a standalone application. The tool generates new Nais application manifests and config maps for your KrakenD instances, based on your existing `Krakend` and `ApiEndpoints` custom resources.

Ensure you are logged in and in the correct namespace, then run the following command to generate the necessary manifests:

```bash
nais alpha krakend convert > krakend-standalone.yaml
```

This generates a set of `Application` and `ConfigMap` manifests for your KrakenD instances, which you can commit to your GitHub repository and apply to your namespace.

Some of the fields are excluded for brevity, but the generated manifest will look something like this:

```yaml hl_lines="19-21" title="app.yaml"
spec:
  accessPolicy:
    outbound:
      external:
        - host: test.maskinporten.no
        - host: someapi.dev-fss-pub.nais.io
  env:
    - name: USAGE_DISABLE
      value: "1"
    - name: FC_ENABLE
      value: "1"
    - name: FC_PARTIALS
      value: /etc/krakend/partials
  filesFrom:
    - configmap: myteam-gw-config
      mountPath: /etc/krakend
    - configmap: myteam-gw-partials
      mountPath: /etc/krakend/partials
  image: krakend:2.12.0
  ingresses:
    - https://myteam-gw.ekstern.dev.nav.no
  liveness:
    initialDelay: 20
    path: /__health
    periodSeconds: 10
  port: 8080
  prometheus:
    enabled: true
    path: /metrics
    port: "9090"
```
Check for the latest version of KrakenD and update the image tag if necessary: [https://www.krakend.io/docs/](https://www.krakend.io/docs/)

**Before applying the generated manifests, you can contact the Nais team to get the label `krakend.nais.io/enabled: "true"` removed from your namespace, to prevent the old resources from being created or updated.**

The generated manifests use the same names and ingresses as your existing deployments, so some manual steps are necessary before applying. You have three choices:

* With downtime: delete the existing `Krakend` and `ApiEndpoints` resources, then apply the new manifests. The new deployment takes over the ingress.
* Without downtime: change the resource names in the generated manifests to avoid conflicts with your existing deployments, then apply them. The new deployment takes over the ingress, and you can remove the old deployment.
* Without downtime: contact the Nais team to remove the `OwnerReferences` from the existing deployments and ingresses. You can then apply the new manifests, which overwrite the old ingress and deployment.


### Monitoring and Logging

#### Logs

KrakenD logs are available in Grafana Loki. You can access these logs as any other application logs in your namespace.

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

These metrics are automatically collected and can be queried using the [Explore view in Grafana](<<tenant_url("grafana", "explore")>>).

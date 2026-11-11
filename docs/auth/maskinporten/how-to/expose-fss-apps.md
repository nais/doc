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

Ensure you are logged in, have `kubectl` installed and configured, and are in the correct namespace, e.g.:

```bash
kubectl config set-context --current --namespace=myteam
```

Then, install the Nais CLI if you haven't already - https://cli.nais.io/

Run the following command to generate the necessary manifests:

```bash
nais alpha krakend convert > krakend-standalone.yaml
```

This generates a set of `Application` and `ConfigMap` manifests for your KrakenD instances, which you can commit to your GitHub repository and apply to your namespace.

Some of the fields are excluded for brevity, but the generated manifest will look something like this:

```yaml title="app.yaml"
spec:
  accessPolicy:
    outbound:
      external:
        - host: test.maskinporten.no
        - host: someapi.dev-fss-pub.nais.io
  env:
    - name: USAGE_DISABLE
      value: "1"
  filesFrom:
    - configmap: myteam-gw-config
      mountPath: /etc/krakend
  image: krakend:3.0.2
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
    port: "9091"
  readiness:
    path: /__health
```
Check for the latest version of KrakenD and update the image tag if necessary: [https://www.krakend.io/docs/](https://www.krakend.io/docs/)


**If your receiving app is in the same cluster (i.e. you have an apiendpoint with backendHost pointing to another app in the same cluster) you must ensure that the receiving app has the correct inbound access policy to allow traffic from your KrakenD instance, e.g:**
```yaml hl_lines="5" title="app.yaml"
spec:
  accessPolicy:
    inbound:
      rules:
        - application: myteam-gw
```
More info in the documentation on [access policies](../../../workloads/how-to/access-policies.md).

Before applying the generated manifests, you can contact the Nais team to get the label `krakend.nais.io/enabled: "true"` removed from your namespace, to prevent the old resources from being created or updated.

After you have applied the generated manifests, you can remove the old `Krakend` resources from your namespace, e.g.:

```bash
kubectl delete krakend myteam
```
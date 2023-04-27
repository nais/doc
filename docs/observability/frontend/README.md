---
description: >-
    NAIS offers solutions for observability for frontend applications.
    This page describes how to use these offerings.
---

# Observability on the frontend

When developing solutions for the frontend there is a variety of different tools for capturing information about
usage, logs, exceptions and performance. NAIS offers a unified solution for full stack frontend observability in
the form of Loki-Grafana-Tempo.

By using the Grafana Faro Web SDK you get
- user monitoring
- performance metrics in the form of [web vitals](https://web.dev/vitals/)
- logging
- exceptions with stack traces
- events
- and traces

## Usage

It is easy to get started, you install and configure the SDK. There is no requirment for extra
code elsewhere.

See the [official documentation](https://grafana.com/docs/grafana-cloud/frontend-observability/) for installation
instructions. There is also an [FAQ](https://grafana.com/docs/grafana-cloud/frontend-observability/faro-web-sdk/faq/)

For configuration, the initialization call looks as follows

```js
initializeFaro({
  url: <Url to the grafana collector>,

  app: {
    name: <The name of your app>,
    version: [A version]
  },
});

```

where the url to the grafana collector is
- `https://telemetry.prod-gcp.nav.cloud.nais.io/collect` for prod environments
- `https://telemetry.dev-gcp.nav.cloud.nais.io/collect` for dev environments.
You are responsible for choosing the correct environment for your deployment.
For local development we recommend using a docker [docker compose](https://github.com/nais/tracing-demo/blob/main/docker-compose.yml) or the dev environment

For nextjs you can use [local environment variables](https://nextjs.org/docs/basic-features/environment-variables)

### using opentelemetry

Faro re-exports the opentelemtry javascript library for creating spans to put logs in a span

### React

There is a pre-release(2023-04-27) package https://github.com/grafana/faro-web-sdk/tree/main/packages/react



## Inspecting logs and traces

Navigate your web browser to the appropriate grafana deployment, e.g https://grafana.nav.cloud.nais.io and choose your app.

### core web vitals
[web vitals on the demo app](https://grafana.nav.cloud.nais.io/d/k8g_nks4z/frontend-web-vitals)

### tracing-demo

### Faro-sdk
Usage of the Grafana Faro Web SDK is described in [Grafan docs](https://grafana.com/docs/grafana-cloud/frontend-observability/). This is a runtime dependency and as such there will be an increase in bundle size, about 500kb.



### Otel
### grafana Dashboards


## Logs

## Metrics

## Traces

---
description: >-
    NAIS offers solutions for observability for frontend applications.
    This page describes how to use these offerings.
search:
  boost: 2
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


### core web vitals
[web vitals on the demo app](https://grafana.nav.cloud.nais.io/d/k8g_nks4z/frontend-web-vitals)

### tracing-demo


## Usage
initializeFaro({
  // Mandatory, the URL of the Grafana Cloud collector with embedded application key.
  // Copy from the configuration page of your application in Grafana.
  url: 'http://faro-collector-us-central-0.grafana.net/collect/{app-key}',

  // Mandatory, the identification label(s) of your application
  app: {
    name: 'my-app',
    version: '1.0.0', // Optional, but recommended
  },

  instrumentations: [
    // Mandatory, overwriting the instrumentations array would cause the default instrumentations to be omitted
    ...getWebInstrumentations(),

    // Mandatory, initialization of the tracing package
    new TracingInstrumentation(),
  ],
});
### Faro-sdk
Usage of the Grafana Faro Web SDK is described in [Grafan docs](https://grafana.com/docs/grafana-cloud/frontend-observability/). This is a runtime dependency and as such there will be an increase in bundle size, about 500kb.



### Otel
### grafana Dashboards

## Logs
import { getWebInstrumentations, initializeFaro } from '@grafana/faro-web-sdk'; web vitals

## Metrics

## Traces

import { TracingInstrumentation } from '@grafana/faro-web-tracing'; 500kb

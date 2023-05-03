---
description: >-
  NAIS offers observability tooling for frontend applications.
  This page describes how to use these offerings.
---

# Frontend application observability

When developing solutions for the frontend there is a variety of different tools for capturing information about
usage, logs, exceptions and performance. NAIS offers a unified solution for full stack frontend observability
through Grafana Faro Web SDK.

Our frontend observability stack offers:

- user monitoring
- [core web vitals](https://web.dev/vitals/) performance metrics
- logging
- exceptions with stack traces
- custom events
- tracing

## Usage

### Metrics and logs

The following instructions are for frontend applications only, running in the browser of the end user.
It is easy to get started, you install and configure the SDK. There is no requirement for extra code elsewhere.

```sh
npm i -S @grafana/faro-web-sdk      # required
npm i -S @grafana/faro-web-tracing  # required for tracing
```

There are also [official documentation](https://grafana.com/docs/grafana-cloud/frontend-observability/) for installation
instructions. There is also an [FAQ](https://grafana.com/docs/grafana-cloud/frontend-observability/faro-web-sdk/faq/).

Inside your application, initialize Faro as follows:

```js
import { initializeFaro } from '@grafana/faro-web-sdk';

initializeFaro({
    url: "http://...",  // required, see below
    app: {
        name: "app-name", // required
        version: "1.2.3"  // optional
    }
});
```

Note that instrumenting an application like this will yield a lot of data. There could be
performance considerations and you may want to put the instrumentation call behind a feature flag
for production environments or scale down the amount of automatic instrumentation as you find
out what you need and think is useful.

Deploy to production. You should start to receive some metrics and logs already.

Use our predefined [web vitals dashboard](https://grafana.nav.cloud.nais.io/d/k8g_nks4z/frontend-web-vitals) to start
visualizing and gain insights.

The URL points to a Grafana Agent collector, and should be set to:

| Collector endpoint                             | Cluster    |
|------------------------------------------------|------------|
| `https://telemetry.nav.no/collect`             | `prod-gcp` |
| `https://telemetry.ekstern.dev.nav.no/collect` | `dev-gcp`  |

On-premises clusters are not supported.

For local development, we recommend checking out our [tracing demo repository](https://github.com/nais/tracing-demo)
and running `docker-compose up`, this will give you local services you can test against. See the README in that
repository for further details.

For NextJS you can use [local environment variables](https://nextjs.org/docs/basic-features/environment-variables).

### Tracing (OpenTelemetry)

In practice, most instrumentation happens behind the scenes and manually adding traces is not necessary. If you want to
add manual traces, Faro re-exports the OpenTelemetry JavaScript library. Usage instructions can be found at
<https://grafana.com/docs/grafana-cloud/frontend-observability/faro-web-sdk/opentelemetry-js/>.

Note that adding tracing will add around 500kB to your JavaScript payload.

To start a new trace, you can:

```js
import { faro, initializeFaro } from '@grafana/faro-web-sdk';
import { TracingInstrumentation } from '@grafana/faro-web-tracing';

initializeFaro({
  url: "http://...",  // required, see below
  app: {
    name: "app-name", // required
    version: "1.2.3"  // optional
  },
  instrumentations: [
    ...getWebInstrumentations(),
    new TracingInstrumentation()
  ]
});

const {trace, context} = faro.api.getOTEL();

const tracer = trace.getTracer('default');
const span = tracer.startSpan('some business process');

const someBusinessProcess = () => {};

context.with(trace.setSpan(context.active(), span), () => {
    someBusinessProcess();
    span.end();
});

```

## Framework integrations

### Next.js

Example integration: https://github.com/navikt/sykmeldinger/commit/d61fdfac72289e716fa9c4f667869c5a2ab7f603

### React

As of 2023-04-27, there is a prerelease package at <https://github.com/grafana/faro-web-sdk/tree/main/packages/react>.

It offers instrumentation over error boundaries, mounts, unmounts and React router.
Instrumenting mounts and unmounts can be quite data intensive, take due care.

## Inspecting logs and traces

Navigate your web browser to the new Grafana at <https://grafana.nav.cloud.nais.io>.

Traces are available from the `dev-gcp-tempo` and `prod-gcp-tempo` data sources, whereas
logs and metrics are available from the `dev-gcp-loki` and `prod-gcp-loki` data sources.

Use the "Explore" tab under either the Loki or Tempo tab and run queries.

For a quick start, use our predefined [web vitals dashboard](https://grafana.nav.cloud.nais.io/d/k8g_nks4z/frontend-web-vitals) to start
visualizing and gain insights.

<!-- Local Variables: -->
<!-- jinx-languages: "en_US" -->
<!-- End: -->

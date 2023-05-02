---
description: >-
    NAIS offers observability tooling for frontend applications.
    This page describes how to use these offerings.
---

TODO: Add external dns for https://telemetry...

# Observability on the frontend

When developing solutions for the frontend there is a variety of different tools for capturing information about
usage, logs, exceptions and performance. NAIS offers a unified solution for full stack frontend observability in
the form of Loki-Grafana-Tempo.

By using the Grafana Faro Web SDK you get:
- user monitoring
- performance metrics a.k.a. [core web vitals](https://web.dev/vitals/)
- logging
- exceptions with stack traces
- events
- traces

## Usage

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
initializeFaro({
  url: "http://...",  // required
  app: {
    name: "app-name", // required
    version: "1.2.3"  // optional
  },
  instrumentations: [...getWebInstrumentations(), new TracingInstrumentation()],
});
```

Note that instrumenting an application like this will yield a lot of data. There could be
performance considerations and you may want to put the instrumentation call behind a feature flag
for production environments.


Deploy to production. You should start to receive some metrics and logs already.

Use our pre-defined [web vitals dashboard](https://grafana.nav.cloud.nais.io/d/k8g_nks4z/frontend-web-vitals) to start visualizing and gain insights.


## Configuration

The URL points to a Grafana Agent collector, and should be set to:
- `https://telemetry.nav.no/collect` if running in `prod-gcp`.
- `https://telemetry.ekstern.dev.nav.no/collect` if running in `dev-gcp`.

On-premises clusters are not supported.

For local development, we recommend checking out our [tracing demo repository](https://github.com/nais/tracing-demo)
and running `docker-compose up`, this will give you local services you can test against. See the README in that repository
for further details.

For NextJS you can use [local environment variables](https://nextjs.org/docs/basic-features/environment-variables).

### using opentelemetry

In practice, most instrumentation happens behind the scenes and manually adding traces is not necesarry. If you want to add manual traces Faro re-exports the opentelemtry javascript library. Usage instructions can be found at
<https://grafana.com/docs/grafana-cloud/frontend-observability/faro-web-sdk/opentelemetry-js/>

To start a new trace, you can
```js
const { trace, context } = faro.api.getOTEL();

const tracer = trace.getTracer('default');
const span = tracer.startSpan('my-cool-span-name');

context.with(trace.setSpan(context.active(), span), () => {
  doSomething();
  span.end();
});

```

### React

There is a pre-release(2023-04-27) package <https://github.com/grafana/faro-web-sdk/tree/main/packages/react>

It offers instrumentation over error boundaries, mounts, unmounts and react router.
Instrumenting mounts and unmounts can be quite data intensive, take due care.


## Inspecting logs and traces

Navigate your web browser to the appropriate grafana deployment, e.g https://grafana.nav.cloud.nais.io and choose your app.

### core web vitals
[web vitals on the demo app](https://grafana.nav.cloud.nais.io/d/k8g_nks4z/frontend-web-vitals)

### tracing-demo
Choose Tempo as a datasource and select a label matching your app.

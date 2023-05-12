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
- [core web vitals](https://web.dev/vitals/) performance metrics (TTFB, FCP, CLS, LCP, FID)
- logging, defaulting to messages from `console.info`, `console.warn`, and `console.error`
- exceptions with stack traces
- custom events
- custom metrics
- tracing (separate section below)

## Usage

### Metrics and logs

The following instructions are for frontend applications only, running in the browser of the end user.
It is easy to get started, you install and configure the SDK. There is no requirement for extra code elsewhere.

Install dependencies:

```sh
npm i -S @grafana/faro-web-sdk      # required
npm i -S @grafana/faro-web-tracing  # required for tracing, see below
```

Inside your application, initialize Faro as follows. You must initialize Faro as early as possible.

```js
import { initializeFaro } from '@grafana/faro-web-sdk';

initializeFaro({
    url: "http://...",  // required, see below
    app: {
        name: "app-name", // required
        version: "1.2.3"  // optional; useful in Grafana to get diff between versions
    }
});
```

The URL points to a Grafana Agent collector, and should be set to one of the following values.
See below for auto-configuration instructions for when your app is a NAIS application.

| Collector endpoint                             | Cluster    |
|------------------------------------------------|------------|
| `https://telemetry.nav.no/collect`             | `prod-gcp` |
| `https://telemetry.ekstern.dev.nav.no/collect` | `dev-gcp`  |
| `http://localhost:12347/collect`               | N/A        |

On-premises clusters are not supported.

For local development, we recommend checking out our [tracing demo repository](https://github.com/nais/tracing-demo)
and running `docker-compose up`, this will give you local services you can test against. See the README in that
repository for further details.

Note that instrumenting an application like this will yield a lot of data. There could be
performance considerations and you may want to put the instrumentation call behind a feature flag
for production environments or scale down the amount of automatic instrumentation as you find
out what you need and think is useful.

Deploy to production. You should start to receive some metrics and logs already.
Use our predefined [web vitals dashboard](https://grafana.nav.cloud.nais.io/d/k8g_nks4z/frontend-web-vitals) to start
visualizing and gain insights.

You can easily add more logging, custom events, and custom metrics.
How to do this is out of scope of this documentation.
Please see the [official documentation](https://grafana.com/docs/grafana-cloud/frontend-observability/).
There is also an [FAQ](https://grafana.com/docs/grafana-cloud/frontend-observability/faro-web-sdk/faq/).

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

## Auto-configuration

When you deploy your frontend as a NAIS application, the telemetry collector URL can be automatically configured.

To use this feature, you must specify `.spec.frontend.generatedConfig.mountPath` in your `nais.yaml`.
A Javascript file will be created at the specified path in your pod file system, and contains the appropriate configuration.
Additionally, the environment variable `NAIS_FRONTEND_TELEMETRY_COLLECTOR_URL` will be set in your pod.

First, create a `nais.js` file with the following contents. This file will be replaced by NAIS
when deployed, and will contain the correct values for your application and environment.

```js
export default {
    telemetryCollectorURL: 'http://localhost:12347/collect',
    app: {
        name: 'myapplication',
        version: 'dev'
    }
};
```

Then, import it from wherever you initialize Faro:

```js
import { initializeFaro } from '@grafana/faro-web-sdk';
import nais from './nais.js';

const faro = initializeFaro({
    url: nais.telemetryCollectorURL,
    app: nais.app
});
```

If you use Webpack, Rollup, or some other bundler, you must exclude that file from the build,
so that the `nais.js` file doesn't end up in your minified bundle. How to do it depends on your bundler.

### Rollup (using Vite)

```js
export default {
  build: {
    manifest: true,
    rollupOptions: {
      external: [
        "./nais.js",
      ],
    },
  },
};
```

### Webpack

```js
// webpack.config.js
module.exports = {
  // Other webpack configuration options...
  externals: {
    // Specify the module name and the global variable it expects at runtime
    './nais.js': 'excludedFile',
  },
};
```
## Framework integrations

### Next.js

For NextJS you can use [local environment variables](https://nextjs.org/docs/basic-features/environment-variables).

Example integration: <https://github.com/navikt/sykmeldinger/commit/d61fdfac72289e716fa9c4f667869c5a2ab7f603>

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

## Troubleshooting

### Content Security Policy

If CSP is enabled for your application, you need to add the telemetry collector endpoint to `connect-src`.

<!-- Local Variables: -->
<!-- jinx-languages: "en_US" -->
<!-- End: -->

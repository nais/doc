---
description: Set up Grafana Faro in your frontend application for real user monitoring, error tracking, and tracing.
tags: [how-to, observability, frontend]
---

# Set up Faro

Add [Grafana Faro](https://www.npmjs.com/package/@grafana/faro-web-sdk) to a frontend application running on Nais.

## Prerequisites

- A frontend application deployed on Nais (GCP only; on-premises is not supported)
- Node.js and npm

## Install

```sh
npm install @grafana/faro-web-sdk
```

If you want browser tracing (connects frontend spans with backend traces), also install:

```sh
npm install @grafana/faro-web-tracing
```

!!! warning "Bundle size"
    `@grafana/faro-web-tracing` adds ~500kB to your JavaScript bundle. Only include it if you need [trace propagation](trace-propagation.md).

## Initialize Faro

Initialize Faro as early as possible in your application so it captures all errors and page loads.

```js
import { initializeFaro, getWebInstrumentations } from '@grafana/faro-web-sdk';

const faro = initializeFaro({
  url: 'https://...', // collector endpoint, see below
  app: {
    name: 'my-app',   // required — identifies your app in Grafana
    version: '1.0.0',  // optional — useful for comparing behavior across deploys
  },
  instrumentations: [
    ...getWebInstrumentations(),
  ],
});
```

For the collector URL, see the [endpoint table](../README.md#collector-endpoints) or use auto-configuration below.

### Setting `app.version`

Setting a version lets you filter and compare metrics across deploys in Grafana. Common approaches:

```js
app: {
  name: 'my-app',
  version: process.env.NEXT_PUBLIC_COMMIT_SHA || 'local',
}
```

You can inject the commit SHA at build time from your CI pipeline, or use the `IMAGE` environment variable set by Nais.

## Auto-configuration

When you deploy on Nais, the collector URL and app config can be generated for you. Add this to your `nais.yaml`:

```yaml
spec:
  frontend:
    generatedConfig:
      mountPath: /usr/share/nginx/html/js/nais.js
```

This creates a JavaScript file at the specified path with the correct collector URL and app metadata. The environment variable `NAIS_FRONTEND_TELEMETRY_COLLECTOR_URL` is also set in your pod.

### Step 1: Create a local `nais.js` fallback

Create a `nais.js` file for local development. Nais replaces this file at deploy time with the real values.

```js
export default {
  telemetryCollectorURL: 'http://localhost:12347/collect',
  app: {
    name: 'my-app',
    version: 'local',
  },
};
```

### Step 2: Import and use it

```js
import { initializeFaro, getWebInstrumentations } from '@grafana/faro-web-sdk';
import nais from './nais.js';

const faro = initializeFaro({
  url: nais.telemetryCollectorURL,
  app: nais.app,
  instrumentations: [
    ...getWebInstrumentations(),
  ],
});
```

### Step 3: Exclude `nais.js` from your bundler

The local fallback file must not be bundled into your production build. Exclude it in your bundler config:

=== "Vite / Rollup"

    ```js
    // vite.config.js
    export default {
      build: {
        rollupOptions: {
          external: ['./nais.js'],
        },
      },
    };
    ```

=== "Webpack"

    ```js
    // webpack.config.js
    module.exports = {
      externals: {
        './nais.js': 'excludedFile',
      },
    };
    ```

=== "Next.js"

    ```js
    // next.config.js
    module.exports = {
      webpack: (config) => {
        config.externals.push('./nais.js');
        return config;
      },
    };
    ```

## Capture exceptions

Console errors are captured automatically. To get full stack traces for caught exceptions, push them to Faro:

```js
try {
  riskyOperation();
} catch (error) {
  faro.api.pushError(error);
}
```

Stack traces from pushed errors are [automatically deobfuscated](sourcemaps.md) if sourcemaps are available.

## Performance tuning

Faro generates a lot of data by default. Use these options to control the volume:

### Session sampling

Only instrument a percentage of user sessions:

```js
initializeFaro({
  // ... other options
  sessionTracking: {
    samplingRate: 0.5, // instrument 50% of sessions
  },
});
```

### Disable console capture

If your app is verbose with console output, disable automatic capture:

```js
initializeFaro({
  // ... other options
  instrumentations: [
    ...getWebInstrumentations({
      captureConsole: false,
    }),
  ],
});
```

### Filter console levels

By default, Faro ignores `console.debug`, `console.trace`, and `console.log`. To change which levels are captured, use the top-level `consoleInstrumentation` config:

```js
import { LogLevel } from '@grafana/faro-web-sdk';

initializeFaro({
  // ... other options
  consoleInstrumentation: {
    disabledLevels: [LogLevel.DEBUG, LogLevel.TRACE], // capture log, info, warn, error
  },
});
```

To capture all levels, pass an empty array: `disabledLevels: []`.

## Content Security Policy (CSP)

If your application uses a Content Security Policy, add the collector endpoint to `connect-src`:

```
connect-src 'self' https://telemetry.nav.no https://telemetry.ekstern.dev.nav.no;
```

Without this, the browser blocks Faro's requests to the collector. See [Troubleshooting](../reference/troubleshooting.md) for more details.

## Verify it works

1. Deploy your application
2. Open it in a browser and interact with it
3. Check the [web vitals dashboard](https://grafana.<<tenant()>>.cloud.nais.io/d/k8g_nks4z/frontend-web-vitals)
4. Or query Loki directly in [Grafana Explore](https://grafana.<<tenant()>>.cloud.nais.io/explore):

```logql
{app_name="my-app"} | logfmt
```

## Real-world examples

These `navikt` repositories use Faro with React Router:

- [`navikt/dp-brukerdialog-frontend`](https://github.com/navikt/dp-brukerdialog-frontend) — includes trace propagation to backend APIs
- [`navikt/bidrag-bidragskalkulator-ui`](https://github.com/navikt/bidrag-bidragskalkulator-ui) — uses `@grafana/faro-react` with router integration

## Next steps

- [Set up Faro with Next.js App Router](setup-nextjs.md)
- [Connect frontend traces to backend spans](trace-propagation.md)
- [Learn how sourcemap deobfuscation works](sourcemaps.md)

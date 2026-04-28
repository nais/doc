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
  url: 'https://telemetry.nav.no/collect',
  paused: window.location.hostname === 'localhost',
  app: {
    name: 'my-app',   // required — identifies your app in Grafana
    version: '1.0.0',  // optional — useful for comparing behavior across deploys
  },
  instrumentations: [
    ...getWebInstrumentations(),
  ],
});
```

!!! tip "Auto-configuration"
    Instead of hardcoding the collector URL, you can let the platform generate it for you. See [auto-configuration](#auto-configuration) below or the [reference page](../reference/auto-configuration.md) for details.

### Setting `app.version`

Setting a version lets you filter and compare metrics across deploys in Grafana. If you use [auto-configuration](#auto-configuration), the version is extracted from your container image tag automatically.

For manual setup, inject the commit SHA from your CI pipeline:

```js
app: {
  name: 'my-app',
  version: process.env.COMMIT_SHA || 'local',
}
```

## Auto-configuration

The platform can generate the collector URL and app metadata for you. This is the recommended approach for static frontends (nginx, CDN) since the URL is set per cluster — no separate config for dev and prod.

Add this to your `nais.yaml`:

```yaml
spec:
  frontend:
    generatedConfig:
      mountPath: /usr/share/nginx/html/js/nais.js
```

This generates a JavaScript file at the specified path containing the collector URL, your app name (from `metadata.name`), and version (from your image tag). The environment variable `NAIS_FRONTEND_TELEMETRY_COLLECTOR_URL` is also set in your pod.

See the [auto-configuration reference](../reference/auto-configuration.md) for the full list of generated values.

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

## Privacy and sensitive data

Faro captures console output, errors, and HTTP request URLs automatically. Make sure you don't leak sensitive data:

- **Never log** fødselsnummer, tokens, passwords, or other PII to the console
- **Watch URLs** — query parameters and path segments may contain identifiers
- **Watch form input** — don't send user input as custom events without redacting

Use the `beforeSend` hook to filter or redact telemetry:

```js
initializeFaro({
  // ... other options
  beforeSend: (item) => {
    // Drop items containing sensitive patterns
    const payload = JSON.stringify(item);
    if (/\d{11}/.test(payload)) {
      return null; // drop items that may contain fødselsnummer
    }
    return item;
  },
});
```

## Local development

Set `paused: window.location.hostname === 'localhost'` (shown in the init example above) to skip telemetry during local development.

For a full local observability stack, check out the [tracing demo repository](https://github.com/nais/tracing-demo) and run `docker-compose up`.

## Verify it works

1. Deploy your application
2. Open it in a browser and interact with it
3. Open your app in Grafana APM and go to the **Frontend** tab to see Core Web Vitals
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

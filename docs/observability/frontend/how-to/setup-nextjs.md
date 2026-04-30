---
description: Set up Grafana Faro in a Next.js application using the App Router.
tags: [how-to, observability, frontend, next.js]
---

# Set up Faro with Next.js

Set up [Grafana Faro](https://www.npmjs.com/package/@grafana/faro-web-sdk) in a Next.js application using the **App Router** (the default since Next.js 13).

Faro is a browser-only SDK and cannot run in React Server Components. You need a `'use client'` component that initializes Faro on the client side.

## Prerequisites

- A Next.js application using the App Router, deployed on Nais
- Node.js and npm

## Install

```sh
npm install @grafana/faro-web-sdk
```

For browser tracing (optional — connects frontend spans with backend traces):

```sh
npm install @grafana/faro-web-tracing
```

## Create the Faro component

Create a client component that initializes Faro. Use `useEffect` to avoid running side effects during server-side rendering or React Strict Mode double-invocations.

{% if tenant() == "nav" %}
```tsx
// app/faro.tsx
'use client';

import { useEffect } from 'react';
import { faro, getWebInstrumentations, initializeFaro } from '@grafana/faro-web-sdk';
import { TracingInstrumentation } from '@grafana/faro-web-tracing';

export default function Faro({ collectorUrl }: { collectorUrl?: string }) {
  useEffect(() => {
    if (faro.api) return; // already initialized

    try {
      initializeFaro({
        url: collectorUrl || 'https://telemetry.nav.no/collect',
        paused: window.location.hostname === 'localhost',
        app: {
          name: 'my-app',
        },
        instrumentations: [
          ...getWebInstrumentations(),
          new TracingInstrumentation(),
        ],
      });
    } catch (e) {
      console.warn('Faro initialization failed', e);
    }
  }, [collectorUrl]);

  return null;
}
```
{% else %}
```tsx
// app/faro.tsx
'use client';

import { useEffect } from 'react';
import { faro, getWebInstrumentations, initializeFaro } from '@grafana/faro-web-sdk';
import { TracingInstrumentation } from '@grafana/faro-web-tracing';

export default function Faro({ collectorUrl }: { collectorUrl?: string }) {
  useEffect(() => {
    if (faro.api) return; // already initialized

    try {
      initializeFaro({
        url: collectorUrl || '<<tenant_url("telemetry.external.prod", "collect")>>',
        paused: window.location.hostname === 'localhost',
        app: {
          name: 'my-app',
        },
        instrumentations: [
          ...getWebInstrumentations(),
          new TracingInstrumentation(),
        ],
      });
    } catch (e) {
      console.warn('Faro initialization failed', e);
    }
  }, [collectorUrl]);

  return null;
}
```
{% endif %}

## Add it to your root layout

Include the component in your root `app/layout.tsx` so Faro initializes on every page. Pass the collector URL from the server environment:

```tsx
// app/layout.tsx
import Faro from './faro';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nb">
      <body>
        <Faro collectorUrl={process.env.NAIS_FRONTEND_TELEMETRY_COLLECTOR_URL} />
        {children}
      </body>
    </html>
  );
}
```

{% if tenant() == "nav" %}
The `NAIS_FRONTEND_TELEMETRY_COLLECTOR_URL` environment variable is set automatically when you enable [`spec.frontend.generatedConfig`](setup-faro.md#auto-configuration) in your `nais.yaml`. If the env var isn't set, the Faro component falls back to `https://telemetry.nav.no/collect`.
{% else %}
The `NAIS_FRONTEND_TELEMETRY_COLLECTOR_URL` environment variable is set automatically when you enable [`spec.frontend.generatedConfig`](setup-faro.md#auto-configuration) in your `nais.yaml`. If the env var isn't set, the Faro component falls back to `<<tenant_url("telemetry.external.prod", "collect")>>`.
{% endif %}

!!! warning "`NEXT_PUBLIC_` env vars are build-time only"
    Don't use `NEXT_PUBLIC_` for the collector URL. Next.js inlines `NEXT_PUBLIC_*` variables at `next build` time, so they won't change per cluster at deploy time. Pass runtime values through Server Components as props instead.

## Configure your `nais.yaml`

Enable auto-configuration to get the collector URL set per cluster:

```yaml
spec:
  frontend:
    generatedConfig:
      mountPath: /tmp/nais.js
```

This sets `NAIS_FRONTEND_TELEMETRY_COLLECTOR_URL` in your pod, which the root layout passes to the Faro component. The `mountPath` can be any writable path — for SSR apps the file itself isn't served to browsers, only the env var matters.

See the [auto-configuration reference](../reference/auto-configuration.md) for all generated values.

## Error boundaries

Next.js App Router has built-in error boundaries via `error.tsx` and `global-error.tsx`. Connect these to Faro to capture React rendering errors:

```tsx
// app/error.tsx
'use client';

import { faro } from '@grafana/faro-web-sdk';
import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    faro.api?.pushError(error);
  }, [error]);

  return (
    <div>
      <h2>Something went wrong</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

Create a similar `app/global-error.tsx` to catch errors in the root layout itself.

## React integration package

The [`@grafana/faro-react`](https://www.npmjs.com/package/@grafana/faro-react) package provides:

- **`<FaroErrorBoundary>`** — wraps components and reports rendering errors to Faro
- **`<FaroRoutes>`** — tracks route changes as navigation events (for React Router)
- **React Router v7 helpers** — `createReactRouterV7Options` and `createReactRouterV7DataOptions` (since v2.2.3)
- **React 19 support** (since v2.1.0)

Install it:

```sh
npm install @grafana/faro-react
```

Use the error boundary to wrap parts of your component tree:

```tsx
import { FaroErrorBoundary } from '@grafana/faro-react';

function MyPage() {
  return (
    <FaroErrorBoundary fallback={<p>Something went wrong</p>}>
      <MyComponent />
    </FaroErrorBoundary>
  );
}
```

!!! warning "Mount/unmount tracking"
    The profiler integration tracks component mounts and unmounts, which generates a lot of data. Only enable it for specific components you want to monitor.

## Next.js webpack externals

If you use the `nais.js` auto-configuration, add this to your `next.config.js`:

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals.push('./nais.js');
    return config;
  },
};

module.exports = nextConfig;
```

## Real-world example

- [`grafana/faro-nextjs-example`](https://github.com/grafana/faro-nextjs-example) — official Grafana example with Next.js App Router

For React Router examples with Faro, see [the main setup guide](setup-faro.md#real-world-examples).

## Further reading

- [Grafana: Instrument Next.js applications](https://grafana.com/docs/grafana-cloud/monitor-applications/frontend-observability/get-started/instrument-nextjs/)
- [Grafana Faro Web SDK changelog](https://github.com/grafana/faro-web-sdk/blob/main/CHANGELOG.md)
- [Connect frontend traces to backend spans](trace-propagation.md)

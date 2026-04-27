---
description: Set up Grafana Faro in a Next.js application using the App Router.
tags: [how-to, observability, frontend, next.js]
---

# Set up Faro with Next.js

Set up [Grafana Faro](https://www.npmjs.com/package/@grafana/faro-web-sdk) in a Next.js application using the **App Router** (the default since Next.js 13).

Faro is a browser-only SDK and cannot run in React Server Components. You need a `'use client'` component that initializes Faro on the client side.

## Prerequisites

- A Next.js application using the App Router, deployed on Nais
- Completed the [basic Faro setup](setup-faro.md) (install, `nais.yaml` config)

## Create the Faro component

Create a client component that initializes Faro. This component renders nothing — it only runs the initialization side effect.

```tsx
// app/faro.tsx
'use client';

import { faro, getWebInstrumentations, initializeFaro } from '@grafana/faro-web-sdk';
import { TracingInstrumentation } from '@grafana/faro-web-tracing';

export default function Faro() {
  if (typeof window === 'undefined' || faro.api) {
    return null;
  }

  try {
    initializeFaro({
      url: process.env.NEXT_PUBLIC_FARO_URL!,
      app: {
        name: process.env.NEXT_PUBLIC_FARO_APP_NAME || 'my-app',
        version: process.env.NEXT_PUBLIC_COMMIT_SHA || '1.0.0',
      },
      instrumentations: [
        ...getWebInstrumentations(),
        new TracingInstrumentation(),
      ],
    });
  } catch (e) {
    // Don't crash the app if Faro fails to initialize
    console.warn('Faro initialization failed', e);
  }

  return null;
}
```

!!! tip "Using auto-configuration"
    If you use the [`nais.js` auto-configuration](setup-faro.md#auto-configuration) instead of environment variables, import `nais.js` here and use `nais.telemetryCollectorURL` and `nais.app` instead. Remember to [exclude `nais.js` from the bundler](setup-faro.md#step-3-exclude-naisjs-from-your-bundler).

## Add it to your root layout

Include the component in your root `app/layout.tsx` so Faro initializes on every page:

```tsx
// app/layout.tsx
import Faro from './faro';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nb">
      <body>
        <Faro />
        {children}
      </body>
    </html>
  );
}
```

## Set environment variables

Configure the collector URL and app name. In your `nais.yaml`, set the environment variables:

```yaml
spec:
  env:
    - name: NEXT_PUBLIC_FARO_URL
      value: "https://telemetry.nav.no/collect"  # or dev URL
    - name: NEXT_PUBLIC_FARO_APP_NAME
      value: "my-app"
    - name: NEXT_PUBLIC_COMMIT_SHA
      value: "{{ .Commit }}"  # injected at build time
```

Or use the [auto-configuration](setup-faro.md#auto-configuration) approach with `nais.js`.

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
- **Profiler integration** — tracks component mount/unmount performance

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
- [Connect frontend traces to backend spans](trace-propagation.md)

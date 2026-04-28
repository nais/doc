---
description: Common issues and solutions for frontend observability with Faro.
tags: [reference, observability, frontend, troubleshooting]
---

# Frontend observability troubleshooting

## Content Security Policy (CSP)

If your application uses a Content Security Policy, the browser blocks Faro's requests to the collector unless you allow them.

Add the collector endpoint to `connect-src`:

{% if tenant() == "nav" %}
```
connect-src 'self' https://telemetry.nav.no https://telemetry.ekstern.dev.nav.no;
```
{% else %}
```
connect-src 'self' <<tenant_url("telemetry.external.prod")>> <<tenant_url("telemetry.external.dev")>>;
```
{% endif %}

**Symptoms:** No data appears in Grafana. Browser console shows errors like `Refused to connect to '...' because it violates the following Content Security Policy directive: "connect-src ..."`.

## CORS errors with trace propagation

When using [trace propagation](../how-to/trace-propagation.md), the browser sends a `traceparent` header to your backend. If your backend doesn't allow this header in CORS, the request may fail or the header is silently dropped.

**Symptoms:** Trace propagation doesn't work (no linked backend spans), or API requests fail with CORS errors in the browser console.

**Fix:** Add `traceparent` to `Access-Control-Allow-Headers` on your backend:

```
Access-Control-Allow-Headers: Content-Type, traceparent
```

## No data in Grafana

If you've deployed Faro but don't see data:

1. **Check the browser console** — look for errors from Faro or network errors to the collector endpoint
2. **Check the Network tab** — filter for requests to the collector URL. You should see POST requests with a `2xx` response
3. **Check the collector URL** — make sure it matches your environment (dev vs prod). See [collector endpoints](../README.md#collector-endpoints)
4. **Check CSP** — see above
5. **Check sampling** — if you set `sessionTracking.samplingRate`, your session might not be sampled. Try setting it to `1.0` temporarily
6. **Wait a moment** — data can take up to a minute to appear in Grafana

## Sourcemaps not resolving

If error stack traces show minified positions instead of source code:

1. **Check that your app is on the CDN** — sourcemap resolution only works for bundles served from `cdn.nav.no`. Server-rendered apps (Next.js, Remix) serving assets from the pod are not supported
2. **Check that sourcemaps are deployed** — your `.map` files must be on the CDN alongside the JS bundle
3. **Check `sourceMappingURL`** — open your deployed JS bundle in a browser and look for `//# sourceMappingURL=` at the bottom. If it's missing, check your bundler config
4. **Check the path** — the `sourceMappingURL` might be a relative path that doesn't resolve correctly from the collector's perspective

See [Sourcemaps](../how-to/sourcemaps.md) for build configuration details.

## High data volume

If Faro generates more data than you need:

- **Reduce session sampling** — set `sessionTracking.samplingRate` to a value between `0` and `1` (e.g., `0.1` for 10% of sessions)
- **Disable console capture** — pass `captureConsole: false` to `getWebInstrumentations()`, particularly if your app produces a lot of console output
- **Remove tracing** — if you don't need browser traces, don't install `@grafana/faro-web-tracing`. This also saves ~500kB in bundle size
- **Use a feature flag** — only initialize Faro for a subset of users

See [Performance tuning](../how-to/setup-faro.md#performance-tuning) for configuration examples.

## Faro not initializing

If `initializeFaro()` throws or Faro doesn't start:

1. **Check the import** — make sure you import from `@grafana/faro-web-sdk`, not a different package
2. **Check `'use client'`** — in Next.js App Router, the file that calls `initializeFaro` must have `'use client'` at the top. Faro can't run in React Server Components
3. **Check for double initialization** — if Faro is already initialized, calling `initializeFaro` again throws. Guard with `if (faro.api) return;`
4. **Check bundler externals** — if you use `nais.js` auto-configuration, make sure the file is excluded from bundling. Otherwise the bundler replaces it with local dev values

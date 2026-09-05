---
description: Auto-generated frontend configuration values, environment variables, and the nais.js file structure.
tags: [reference, observability, frontend]
---

# Auto-configuration reference

When you enable `spec.frontend.generatedConfig` in your `nais.yaml`, the platform generates configuration values your frontend can use at runtime. This removes the need to hardcode collector URLs or app metadata.

```yaml
spec:
  frontend:
    generatedConfig:
      mountPath: /usr/share/nginx/html/js/nais.js
```

{% if tenant() == "nav" %}
!!! tip "`@nais/apm` reads these automatically"
    If you instrument with [`@nais/apm`](../../apm/tutorials/track-frontend-errors.md),
    you don't consume this file by hand. `init()` resolves the app name, version,
    environment, and collector URL from Nais meta tags in your served HTML or from
    the build-time `NAIS_*` environment variables — see
    [Configuration resolution](../../apm/reference/apm-client-api.md#configuration-resolution).
    This reference matters when you wire up **raw Faro** yourself.
{% endif %}

## Generated JavaScript file

The platform creates a JavaScript file at the specified `mountPath` with this structure:

{% if tenant() == "nav" %}
```js
export default {
  schemaVersion: 1,
  telemetryCollectorURL: 'https://telemetry.nav.no/collect',
  app: {
    name: 'my-app',        // from metadata.name in nais.yaml
    namespace: 'my-team',  // from metadata.namespace in nais.yaml
    version: '2024-03-15-abc1234', // extracted from your container image tag
  },
  environment: 'prod-gcp', // the cluster this pod runs in
};
```
{% else %}
```js
export default {
  schemaVersion: 1,
  telemetryCollectorURL: '<<tenant_url("telemetry.external.prod", "collect")>>',
  app: {
    name: 'my-app',        // from metadata.name in nais.yaml
    namespace: 'my-team',  // from metadata.namespace in nais.yaml
    version: '2024-03-15-abc1234', // extracted from your container image tag
  },
  environment: 'prod-gcp', // the cluster this pod runs in
};
```
{% endif %}

| Field                  | Source                                    |
| ---------------------- | ----------------------------------------- |
| `schemaVersion`        | The payload contract generation (currently `1`); check it if you parse the file yourself |
| `telemetryCollectorURL` | Set per cluster by the platform operator |
| `app.name`             | `metadata.name` from your `nais.yaml`     |
| `app.namespace`        | `metadata.namespace` from your `nais.yaml` |
| `app.version`          | Tag from your container image              |
| `environment`          | The cluster your app runs in (e.g. `prod-gcp`) |

The payload is a **versioned contract**: the shape only changes together with a
`schemaVersion` bump, and consumers (like `@nais/apm`) accept both the current
and the previous generation.

The collector URL is set automatically based on which cluster your app runs in — you don't need separate config for dev and prod.

## Generated JSON file

The same payload is also generated as `nais.json`, mounted **next to** the
JavaScript file (same directory as your `mountPath`). Use it when a `fetch()`
is more convenient than an ES module import — for example a static SPA that
serves its web root:

```yaml
spec:
  frontend:
    generatedConfig:
      mountPath: /usr/share/nginx/html/nais.js   # nais.json is mounted alongside
```

{% if tenant() == "nav" %}
With [`@nais/apm`](../../apm/tutorials/track-frontend-errors.md) this is one call —
it fetches the file, applies it, and buffers any signals raised while the fetch
is in flight:

```ts
import { initFromConfigUrl } from '@nais/apm';

void initFromConfigUrl('/nais.json', { app: 'my-app', namespace: 'my-team' });
```
{% endif %}

!!! note "Cache the config file carefully"
    The generated files are not content-hashed. If you serve them from your web
    root, give them `Cache-Control: no-cache` (or a short TTL) so a new deploy's
    values are picked up.

## Environment variable

The platform also sets this environment variable in your pod:

| Variable                                  | Description                     |
| ----------------------------------------- | ------------------------------- |
| `NAIS_FRONTEND_TELEMETRY_COLLECTOR_URL`   | The telemetry collector URL for your cluster |

This is useful for server-rendered applications (Next.js, Remix) where the server can read the env var and pass it to client-side code. See the [Next.js guide](../how-to/setup-nextjs.md) for an example.

!!! warning "`NEXT_PUBLIC_` env vars are build-time only"
    Don't re-export this as a `NEXT_PUBLIC_*` variable. Next.js inlines `NEXT_PUBLIC_*` values at `next build` time, so they won't reflect the runtime pod environment.

{% if tenant() == "nav" %}
## Collector URLs by environment

| Cluster     | Collector URL                                  |
| ----------- | ---------------------------------------------- |
| `prod-gcp`  | `https://telemetry.nav.no/collect`             |
| `dev-gcp`   | `https://telemetry.ekstern.dev.nav.no/collect` |

On-premises clusters (`prod-fss`, `dev-fss`) are not supported.
{% endif %}

## When to use auto-configuration

**Static frontends (nginx, CDN):** Use the generated `nais.js` file. Import it at runtime and use `nais.telemetryCollectorURL` and `nais.app`. See the [setup guide](../how-to/setup-faro.md#auto-configuration).

**Server-rendered apps (Next.js, Remix):** Read `NAIS_FRONTEND_TELEMETRY_COLLECTOR_URL` on the server and pass it to your client-side Faro initialization. See the [Next.js guide](../how-to/setup-nextjs.md).

{% if tenant() == "nav" %}
**Simple alternative:** Use `https://telemetry.nav.no/collect` directly in your production code. The URL is stable and all production clusters use the same endpoint.
{% else %}
**Simple alternative:** Use `<<tenant_url("telemetry.external.prod", "collect")>>` directly in your production code. The URL is stable and all production clusters use the same endpoint.
{% endif %}

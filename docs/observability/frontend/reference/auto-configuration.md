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

## Generated JavaScript file

The platform creates a JavaScript file at the specified `mountPath` with this structure:

```js
export default {
  telemetryCollectorURL: 'https://telemetry.nav.no/collect',
  app: {
    name: 'my-app',        // from metadata.name in nais.yaml
    version: '2024-03-15-abc1234', // extracted from your container image tag
  },
};
```

| Field                  | Source                                    |
| ---------------------- | ----------------------------------------- |
| `telemetryCollectorURL` | Set per cluster by the platform operator |
| `app.name`             | `metadata.name` from your `nais.yaml`     |
| `app.version`          | Tag from your container image              |

The collector URL is set automatically based on which cluster your app runs in — you don't need separate config for dev and prod.

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

**Simple alternative:** Use `https://telemetry.nav.no/collect` directly in your production code. The URL is stable and all production clusters use the same endpoint.

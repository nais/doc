---
description: Send custom measurements from the browser and query them in Grafana.
tags: [how-to, observability, frontend, metrics]
---

# Custom frontend metrics

Faro can send custom numeric measurements from the browser to Loki. Use this to track application-specific metrics like load times for specific components, feature usage counts, or business-relevant durations.

!!! warning "Never put personal data in a custom measurement"
    Measurement **values**, event attributes, and everything you pass as
    `context` are written verbatim to **shared observability storage (Loki)**
    that every team on the platform can query. Treat a custom measurement like a
    public log line.

    **Never** put a `fødselsnummer`, a name, an address, or any other
    personopplysning into a measurement value, a `context_*` field, an event
    attribute, or `setUser`. Use only opaque, non-identifying keys — a hashed or
    otherwise non-reversible id instead of a raw user identifier, and a category
    instead of a person.

    The ingestion pipeline scrubs 11-digit fødselsnummer as a defense-in-depth
    backstop, but it is regex-based and you **must not rely on it**: it cannot
    catch names, addresses, or free text, and it does not touch numeric
    measurement values at all.

{% if tenant() == "nav" %}
!!! danger "Personvern: NAV-identer and names are never scrubbed"
    Real NAV personopplysninger have already leaked into shared Loki through
    custom telemetry. Beyond fødselsnummer, **never** put **NAV-identer
    (Z-/NAV-numre)**, employee or citizen names, `enhet`-/office names, or case
    details into measurement values, `context_*`, event attributes, or
    `setUser`. Regex scrubbing **cannot** catch any of these — only fødselsnummer
    is scrubbed, and only as a backstop. This is the same rule the
    [`@nais/apm` Privacy section](../../apm/reference/apm-client-api.md#privacy-pii-scrubbing)
    applies to `setUser`: prefer a hashed or opaque id.
{% endif %}

## Send a measurement

Use `faro.api.pushMeasurement` to send named numeric values:

```js
import { faro } from '@grafana/faro-web-sdk';

faro.api.pushMeasurement({
  type: 'custom',
  values: {
    search_results_ms: 342,
  },
});
```

{% if tenant() == "nav" %}
!!! tip "Using `@nais/apm`? Reach `pushMeasurement` through `init()`"
    nais browser apps set up telemetry through
    [`@nais/apm`](../../apm/tutorials/track-frontend-errors.md), which
    **deliberately does not wrap** `pushMeasurement` / `pushEvent`. Its `init()`
    returns the underlying Faro instance — call the raw Faro API on that value
    rather than importing a separate `faro` singleton:

    ```js
    import { init } from '@nais/apm';

    // Call once at app startup; returns the underlying Faro instance.
    // Calling init() again elsewhere safely returns the same instance.
    const faro = init();

    faro.api.pushMeasurement({
      type: 'custom',
      values: { search_results_ms: 342 },
    });
    ```

    `@nais/apm`'s PII scrubbing runs inside its Faro `beforeSend` and only
    rewrites fødselsnummer, emails, and token URL parameters. It does **not**
    clean numeric measurement values and never catches NAV-identer or names, so
    custom measurements and events get **no meaningful PII protection** from the
    wrapper — the warning above applies in full.

    Manual custom **spans** aren't supported by `@nais/apm` either: browser
    tracing is automatic only, so there is no custom-span API to reach for.
{% endif %}

You can send multiple values in a single measurement:

```js
faro.api.pushMeasurement({
  type: 'checkout-timing',
  values: {
    payment_form_render_ms: 120,
    total_checkout_ms: 4500,
  },
});
```

### Add context

Attach string key-value pairs as context for filtering:

```js
faro.api.pushMeasurement(
  {
    type: 'api-call',
    values: {
      duration_ms: 230,
    },
  },
  {
    context: {
      endpoint: '/api/soknader',
      method: 'POST',
    },
  },
);
```

## Query in Grafana

Custom measurements are stored in Loki as structured log lines with `kind=measurement`. Query them with LogQL.

### Filter by type

```logql
{app_name="my-app", kind="measurement"} | logfmt | type="custom"
```

### Extract numeric values

Use `unwrap` to turn a logfmt field into a numeric sample for aggregation:

```logql
avg_over_time(
  {app_name="my-app", kind="measurement"}
  | logfmt
  | type="api-call"
  | unwrap duration_ms [5m]
) by (context_endpoint)
```

### Percentiles

```logql
quantile_over_time(0.95,
  {app_name="my-app", kind="measurement"}
  | logfmt
  | type="checkout-timing"
  | unwrap total_checkout_ms [5m]
)
```

### Count occurrences

```logql
count_over_time(
  {app_name="my-app", kind="measurement"}
  | logfmt
  | type="custom"
  [5m]
)
```

## Naming conventions

| Guideline | Example |
| --------- | ------- |
| Use snake_case for value names | `search_results_ms`, not `searchResultsMs` |
| Include units in the name | `duration_ms`, `size_bytes` |
| Use a descriptive `type` | `"checkout-timing"`, not `"custom"` |
| Keep context values low-cardinality | Endpoints, categories — not UUIDs or user IDs |

## How it works

```
Browser                     Alloy                  Loki
  │                           │                      │
  │  pushMeasurement(...)     │                      │
  │──────────────────────────▶│                      │
  │                           │  logfmt log line     │
  │                           │  kind=measurement    │
  │                           │  type=checkout-timing│
  │                           │  total_checkout_ms=4500
  │                           │──────────────────────▶│
  │                           │                      │
```

Measurements are sent to the Faro collector, converted to logfmt, and stored in Loki with the stream labels `{app_name, kind, env}`. The measurement values and context end up as logfmt fields in the log line, queryable with `| logfmt` and `| unwrap`.

!!! info "No Prometheus metrics for custom measurements"
    Unlike Web Vitals (which are automatically extracted as Prometheus histograms), custom measurements are only stored in Loki. Use LogQL `unwrap` for numeric aggregation. This keeps the metric cardinality bounded while giving you full flexibility in what you measure.

## Example: track component render time

```tsx
import { faro } from '@grafana/faro-web-sdk';
import { useEffect, useRef } from 'react';

function ExpensiveComponent() {
  const startRef = useRef(performance.now());

  useEffect(() => {
    const renderTime = performance.now() - startRef.current;
    faro.api.pushMeasurement(
      {
        type: 'component-render',
        values: {
          render_ms: Math.round(renderTime),
        },
      },
      {
        context: {
          component: 'ExpensiveComponent',
        },
      },
    );
  }, []);

  return <div>...</div>;
}
```

Then query the P95 render time:

```logql
quantile_over_time(0.95,
  {app_name="my-app", kind="measurement"}
  | logfmt
  | type="component-render"
  | context_component="ExpensiveComponent"
  | unwrap render_ms [5m]
)
```

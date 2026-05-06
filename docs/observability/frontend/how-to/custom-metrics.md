---
description: Send custom measurements from the browser and query them in Grafana.
tags: [how-to, observability, frontend, metrics]
---

# Custom frontend metrics

Faro can send custom numeric measurements from the browser to Loki. Use this to track application-specific metrics like load times for specific components, feature usage counts, or business-relevant durations.

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
    faro.api.pushMeasurement({
      type: 'component-render',
      values: {
        render_ms: Math.round(renderTime),
      },
      context: {
        component: 'ExpensiveComponent',
      },
    });
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

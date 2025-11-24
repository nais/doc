---
title: Instrumenting Your Application with OpenTelemetry
tags: [tutorial, observability, opentelemetry]
---

# Instrumenting Your Application with OpenTelemetry

This tutorial shows how to add **custom spans and metrics** to your application when you are already using OpenTelemetry auto-instrumentation in Nais.

## Prerequisites

- Application running on Nais with [auto-instrumentation enabled](../how-to/auto-instrumentation.md)
- Access to your application's source code

---

## 1. Why Add Custom Instrumentation?

Auto-instrumentation provides traces and metrics for supported libraries and frameworks out of the box. However, to gain deeper insight into your business logic, you may want to:

- Add custom spans to trace specific operations or workflows
- Create custom metrics for business or application-specific events

---

## 2. Add Custom Spans

Custom spans let you trace important operations in your code. This is useful for tracking business logic, performance bottlenecks, or external calls not covered by auto-instrumentation.

**Example in Java:**

```java
import io.opentelemetry.api.trace.Span;
import io.opentelemetry.api.trace.Tracer;
import io.opentelemetry.api.GlobalOpenTelemetry;

public class MyService {
  private static final Tracer tracer = GlobalOpenTelemetry.getTracer("my-app");

  public void doWork() {
    Span span = tracer.spanBuilder("custom-operation").startSpan();
    try {
      // Your business logic here
    } finally {
      span.end();
    }
  }
}
```

**Other languages:** See the [OpenTelemetry documentation](https://opentelemetry.io/docs/) for language-specific APIs.

---

## 3. Add Custom Metrics

Custom metrics help you track application-specific events, counters, or timings. These metrics are exported to Prometheus and visualized in Grafana.

**Example in Java:**

```java
import io.opentelemetry.api.metrics.Meter;
import io.opentelemetry.api.metrics.GlobalMeterProvider;

public class MyMetrics {
  private static final Meter meter = GlobalMeterProvider.getMeter("my-app");

  // Example: Counter
  private static final LongCounter myCounter = meter
    .counterBuilder("my_custom_counter")
    .setDescription("A custom counter for my app")
    .build();

  public void recordEvent() {
    myCounter.add(1);
  }
}
```

**Other languages:** See the [OpenTelemetry metrics documentation](https://opentelemetry.io/docs/) for details.

---

## 4. Deploy and Verify

1. Deploy your application as usual.
2. In Grafana, use the Tempo data source to view traces (including your custom spans).
3. Use the Prometheus data source to query your custom metrics.

---

## Next Steps

- [Correlate traces and logs](../tracing/how-to/correlate-traces-logs.md)
- [Create custom metrics](../metrics/how-to/expose.md)
- [Set up alerting](../alerting/README.md)

For more details, see the [OpenTelemetry documentation](https://opentelemetry.io/docs/).

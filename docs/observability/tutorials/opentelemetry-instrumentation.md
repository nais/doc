---
title: Adding Custom Spans and Metrics with OpenTelemetry
tags: [tutorial, observability, opentelemetry]
---

# Adding Custom Spans and Metrics

Auto-instrumentation covers HTTP, database, and messaging calls out of the box. To trace your own business logic or track application-specific events, add custom spans and metrics using the OpenTelemetry SDK.

## Prerequisites

- Application running on Nais with [auto-instrumentation enabled](../how-to/auto-instrumentation.md)
- Access to your application's source code

## 1. Add custom spans

Custom spans let you trace operations not covered by auto-instrumentation — business logic, batch jobs, or complex workflows.

### Kotlin with `@WithSpan`

The `@WithSpan` annotation is the simplest way to trace a method. The OpenTelemetry Java agent picks it up automatically.

Add the dependency:

=== "Gradle (Kotlin DSL)"

    ```kotlin
    dependencies {
        implementation("io.opentelemetry.instrumentation:opentelemetry-instrumentation-annotations:2.14.0")
    }
    ```

=== "Maven"

    ```xml
    <dependency>
        <groupId>io.opentelemetry.instrumentation</groupId>
        <artifactId>opentelemetry-instrumentation-annotations</artifactId>
        <version>2.14.0</version>
    </dependency>
    ```

Then annotate methods you want to trace:

```kotlin
import io.opentelemetry.instrumentation.annotations.WithSpan
import io.opentelemetry.instrumentation.annotations.SpanAttribute

class PaymentService {

    @WithSpan("process-payment")
    fun processPayment(
        @SpanAttribute("payment.amount") amount: Long,
        @SpanAttribute("payment.currency") currency: String
    ): PaymentResult {
        // This method call becomes a span in your traces.
        // @SpanAttribute adds the parameter values as span attributes.
        validate(amount, currency)
        return execute(amount, currency)
    }

    @WithSpan
    private fun validate(amount: Long, currency: String) {
        // Nested span — appears as a child of "process-payment"
    }
}
```

### Java with the Tracer API

For more control (dynamic span names, adding events, setting status), use the Tracer API directly:

```java
import io.opentelemetry.api.trace.Span;
import io.opentelemetry.api.trace.Tracer;
import io.opentelemetry.api.GlobalOpenTelemetry;

public class MyService {
    private static final Tracer tracer =
        GlobalOpenTelemetry.getTracer("my-app");

    public void doWork() {
        Span span = tracer.spanBuilder("custom-operation").startSpan();
        try (var scope = span.makeCurrent()) {
            // Your business logic here
            span.addEvent("checkpoint-reached");
        } catch (Exception e) {
            span.recordException(e);
            span.setStatus(io.opentelemetry.api.trace.StatusCode.ERROR);
            throw e;
        } finally {
            span.end();
        }
    }
}
```

### Node.js

```javascript
import { trace } from "@opentelemetry/api";

const tracer = trace.getTracer("my-app");

async function processOrder(orderId) {
  return tracer.startActiveSpan("process-order", async (span) => {
    try {
      span.setAttribute("order.id", orderId);
      const result = await executeOrder(orderId);
      return result;
    } catch (error) {
      span.recordException(error);
      span.setStatus({ code: 2 }); // ERROR
      throw error;
    } finally {
      span.end();
    }
  });
}
```

## 2. Add custom metrics

Custom metrics track application-specific counters, gauges, or histograms. These are exported to Mimir and available in Grafana.

### Kotlin / Java

```kotlin
import io.opentelemetry.api.GlobalOpenTelemetry
import io.opentelemetry.api.metrics.LongCounter

object AppMetrics {
    private val meter = GlobalOpenTelemetry.getMeter("my-app")

    val ordersProcessed: LongCounter = meter
        .counterBuilder("orders_processed_total")
        .setDescription("Number of orders processed")
        .build()
}

// Usage:
AppMetrics.ordersProcessed.add(1, Attributes.of(
    AttributeKey.stringKey("status"), "completed"
))
```

!!! note "OTel Metrics API"
    Use `GlobalOpenTelemetry.getMeter()` (not `GlobalMeterProvider.getMeter()`, which was removed in OpenTelemetry Java 2.x).

### Node.js

```javascript
import { metrics } from "@opentelemetry/api";

const meter = metrics.getMeter("my-app");
const ordersProcessed = meter.createCounter("orders_processed_total", {
  description: "Number of orders processed",
});

// Usage:
ordersProcessed.add(1, { status: "completed" });
```

## 3. Verify in APM

1. Deploy your application
2. Open the [Nais APM](<<tenant_url("grafana", "a/nais-apm-app")>>) and find your service
3. Check the **Operations** tab — your custom spans appear as operations
4. In [Grafana Explore](<<tenant_url("grafana", "explore")>>), query your custom metrics with PromQL

## Next steps

- [:books: Auto-instrumentation configuration reference](../reference/auto-config.md)
- [Correlate traces and logs](../tracing/how-to/correlate-traces-logs.md)
- [Set up alerting](../alerting/README.md)

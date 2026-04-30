---
description: Fix inflated error rates in APM caused by exceptions that produce expected 4xx responses.
tags: [how-to, tracing, observability]
---

# Avoid false errors from expected 4xx responses

If your service shows a high error rate in [Nais APM](<<tenant_url("grafana", "a/nais-apm-app")>>) but most "errors" are actually HTTP 404 or 400 responses that are normal for your application, this guide explains why it happens and how to fix it.

## The problem

Many web frameworks use exceptions for flow control — throw a `NotFoundException`, and a handler like Ktor's `StatusPages` or Spring Boot's `@ExceptionHandler` converts it to an HTTP 404.

The OTel auto-instrumentation agent hooks into your framework and sees that exception propagate **before** it gets caught. It marks the span as `STATUS_CODE_ERROR` and records the exception. By the time your framework returns a 404, the error is already recorded.

The result: APM dashboards count these as server errors even though the HTTP response is a normal 4xx.

The OTel spec is clear about what should happen — [HTTP semantic conventions](https://opentelemetry.io/docs/specs/semconv/http/http-spans/#status) say:

> For HTTP status codes in the 4xx range, span status **MUST be left unset** in case of `SpanKind.SERVER`.

The agent follows this rule for status codes, but thrown exceptions override it. This is a [known limitation](https://github.com/open-telemetry/opentelemetry-specification/issues/1818) in the spec.

## When to fix it

This is worth fixing on routes where:

- The 4xx response is a **normal business outcome** (e.g., "person not found" returns 404)
- The route gets **a lot of traffic**. A high-volume route with 404s will dominate your error rate
- You want **reliable error-rate alerting** from APM

If the route is low-volume or the 4xx is rare, the noise probably doesn't matter.

## How to fix it

Return the HTTP response directly instead of throwing an exception. The span status stays `UNSET` (correct for 4xx), and APM counts only real 5xx errors.

### Ktor

```kotlin
// Before — exception triggers ERROR span status
get("/person/{id}") {
    val person = repository.find(id)
        ?: throw NotFoundException("Person not found")
    call.respond(person)
}

// After — respond directly, span status stays UNSET
get("/person/{id}") {
    val person = repository.find(id)
    if (person == null) {
        call.respond(HttpStatusCode.NotFound, mapOf(
            "title" to "Not Found",
            "detail" to "Person not found",
            "status" to 404,
        ))
        return@get
    }
    call.respond(person)
}
```

Your `StatusPages` configuration can stay. It still handles unexpected exceptions. You're only changing the routes where 4xx is an expected outcome.

### Spring Boot (Kotlin)

```kotlin
// Before — exception handled by @ExceptionHandler, but agent already captured it
@GetMapping("/person/{id}")
fun getPerson(@PathVariable id: String): Person {
    return repository.find(id)
        ?: throw PersonNotFoundException("Person not found")
}

// After — return ResponseEntity directly
@GetMapping("/person/{id}")
fun getPerson(@PathVariable id: String): ResponseEntity<Any> {
    val person = repository.find(id)
        ?: return ResponseEntity.notFound().build()
    return ResponseEntity.ok(person)
}
```

## Verify the fix

After deploying, the route should still return the same HTTP status code, but the `STATUS_CODE_ERROR` count should drop. Check in [Nais APM](<<tenant_url("grafana", "a/nais-apm-app")>>) or query span metrics directly:

```promql
rate(traces_spanmetrics_calls_total{
  service_name="<your-app>",
  span_kind="SPAN_KIND_SERVER",
  status_code="STATUS_CODE_ERROR",
  http_response_status_code=~"4.."
}[1h])
```

This should return 0 (or close to it) for the fixed routes.

## References

- [OTel HTTP semantic conventions — span status](https://opentelemetry.io/docs/specs/semconv/http/http-spans/#status)
- [opentelemetry-specification#1818 — exception vs. status code](https://github.com/open-telemetry/opentelemetry-specification/issues/1818)
- [Span metrics reference](../reference/span-metrics.md)

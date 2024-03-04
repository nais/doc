---
description: Learn how to propagate trace context across process boundaries in a few common scenarios.
tags: [guide, tracing]
---
# Trace context propagation

Each Span carries a Context that includes metadata about the trace (like a unique trace identifier and span identifier) and any other data you choose to include. This context is propagated across process boundaries, allowing all the work that's part of a single trace to be linked together, even if it spans multiple services.

This guide explains how to propagate trace context across process boundaries in a few common scenarios. If you are using [auto-instrumentation](../auto-instrumentation.md), trace context propagation is already handled for you.

[:octicons-link-external-24: OpenTelemetry Context Propagation](https://opentelemetry.io/docs/concepts/context-propagation/)

## Propagate trace context in HTTP requests

When a service makes an HTTP request to another service, it should include the trace context in the request headers. The receiving service can then use this context to create a new Span that's part of the same trace. OpenTelemetry provides a standard for how trace context should be propagated in HTTP requests, called the [W3C Trace Context](https://www.w3.org/TR/trace-context/) standard.

* [OpenTelemetry Setup in Spring Boot Application](https://opentelemetry.io/docs/languages/java/automatic/spring-boot)
* [OpenTelemetry Setup in Ktor Application](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/ktor/ktor-2.0/library)
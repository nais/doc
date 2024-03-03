# Trace context propagation

Each Span carries a Context that includes metadata about the trace (like a unique trace identifier and span identifier) and any other data you choose to include. This context is propagated across process boundaries, allowing all the work that's part of a single trace to be linked together, even if it spans multiple services.

* https://opentelemetry.io/docs/concepts/context-propagation/
* https://www.w3.org/TR/trace-context/#examples-of-http-traceparent-headers
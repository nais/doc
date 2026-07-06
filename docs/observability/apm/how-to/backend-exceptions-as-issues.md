---
title: Get backend exceptions into Issues
description: >-
  Get your backend exceptions — JVM (Spring Boot, Ktor) and Node.js — into the
  Nais APM Issues tab with tight grouping and a stack trace, whether you log to
  stdout (the default) or export logs over OpenTelemetry.
tags: [how-to, observability, apm, logging]
---

# Get backend exceptions into Issues

The Nais APM **Issues** tab groups your service's backend exceptions from Loki.
How good that grouping is depends entirely on *how the exception reaches Loki* —
and in particular on which of the two log-ingest paths your app uses.

Most nais apps ship logs the default way — **stdout → fluentbit → Loki** — and
deliberately do **not** enable OpenTelemetry log export (they keep control of
stdout, often to multi-ship some logs elsewhere). So this guide leads with
getting the best possible Issues on that default path, then covers the
OpenTelemetry option that unlocks the richest shape.

## Why the log shape matters

Nais APM reads three shapes of backend exception from Loki, best to worst:

| Shape | What Loki has | Result in Issues |
|-------|---------------|------------------|
| **A — semconv metadata** | `exception_type`, `exception_message`, `exception_stacktrace` as [structured metadata](../../logging/reference/loki-labels.md) | **First-class.** Grouped by type + message, every occurrence counted, full stack trace, pod impact. |
| **B — JSON body** | A JSON log line with `message`/`msg` and an error-class `level` | Grouped by message only (no type), counted per occurrence. |
| **C — plain text** | A multi-line stack trace printed to stdout | **Weak.** Sampled, not fully counted, grouped on the lead line — lossy. |

## Which path do your logs take?

Your ceiling is set by **how your logs get into Loki**, not by your logging code
alone:

| Path | What Loki gets | Best shape reachable |
|------|----------------|----------------------|
| **stdout → fluentbit → Loki** (default) | The raw line as the log **body**. fluentbit attaches only Kubernetes fields (`service_name`, `service_namespace`, `k8s_cluster_name` as labels; pod/node/container/collector as structured metadata). It does **not** parse your JSON or promote app fields like `exception_type`. | **Shape B** — the Issues tab parses your JSON body with a `json` stage at query time and groups by message. |
| **OpenTelemetry log export** (opt-in) | Each log-record attribute — including `exception.*` — stored as **structured metadata** by Loki's OTLP endpoint. | **Shape A** — grouped by type + message, with the class and full stack. |

So on the default stdout path, **shape B is the ceiling**: an `exception_type`
field *inside* your JSON body is never promoted to a label, and shape A selects
on `exception_type != ""` as structured metadata — so it can only match logs that
arrived over OpenTelemetry.

## Get the best Issues over stdout (shape B)

This is the path most teams are on. Three habits get you the tightest, most
useful backend Issues that Loki can give you without OpenTelemetry.

### 1. Log structured JSON

Shape B is parsed with `| json`, so your stdout lines must be JSON with a
`message` (or `msg`) field and an error-class `level`. Use your framework's JSON
encoder:

- **JVM (Spring Boot / Ktor):** `logstash-logback-encoder`.
- **Node.js (Express / Next.js):** Pino or Winston in JSON mode.

### 2. Keep the error message a stable literal

Shape B groups by the **message**. If you interpolate a case id, URL, or count
into the message, every occurrence becomes its own group and one error fragments
into dozens of near-duplicate Issues. Keep the message a fixed string and put the
variable data in **separate JSON fields**:

**JVM (Kotlin)**

```kotlin
// BAD — the id in the message fragments grouping
log.error("Failed to fetch behandling $behandlingId")
// GOOD — stable message; id as a structured field (StructuredArguments.kv)
log.error("Failed to fetch behandling", kv("behandlingId", behandlingId), e)
```

**Node.js (Pino)**

```javascript
// BAD — id in the message fragments grouping
logger.error(`Failed to fetch behandling ${behandlingId}`);
// GOOD — stable message, id as a field, error as an object
logger.error({ behandlingId, err }, "Failed to fetch behandling");
```

### 3. Log the exception as an object

Pass the throwable / `Error` object to the logger — never a string you built from
it. On the stdout path this puts the exception's **stack trace** into the JSON
line, which the Issues tab's occurrence drawer reads from a top-level
`stack_trace` or `stack` field:

- `logstash-logback-encoder` writes the stack to `stack_trace` automatically.
- Winston with `format.errors({ stack: true })` writes a top-level `stack`.
- Pino nests it under `err.stack`; add a top-level `stack` (or a custom
  serializer) if you want it in the drawer.

!!! note "What shape B gives you — and what it doesn't"
    Shape B groups by **message only**. The exception **class** is *not* used for
    grouping and is *not* shown in the occurrence detail on this path — only the
    OpenTelemetry path (shape A) carries the class. So on stdout your two levers
    are a **stable message** (tight grouping) and the **stack trace** in the
    drawer. That's a solid backend Issue; it just isn't the full shape A.

## Reach shape A with OpenTelemetry log export (one option)

If you already use OpenTelemetry logs, or you're willing to dual-ship, exporting
logs over OTLP is the only way to reach **shape A** today. The collector sends
each log record to Loki's OTLP endpoint, which stores the semantic-convention
exception attributes as structured metadata:

- `exception.type` → `exception_type`
- `exception.message` → `exception_message`
- `exception.stacktrace` → `exception_stacktrace`

The Issues tab then groups on `exception_type` + `exception_message`, with the
class and full stack trace in each Issue.

!!! warning "This takes over your logs"
    `OTEL_LOGS_EXPORTER=otlp` sends **all** your logs through the collector and is
    not compatible with [Team Logs](../../logging/how-to/team-logs.md). Your
    container also keeps writing to stdout, so lines can land in Loki twice (see
    [Known limitations](#known-limitations-and-cost)). This is why most teams stay
    on the stdout path — enable OTLP only if you actively want it.

### JVM (Spring Boot and Ktor)

Enable the Java agent's log bridge and log with the throwable. In `nais.yaml`:

```yaml title="nais.yaml"
spec:
  observability:
    autoInstrumentation:
      enabled: true
      runtime: java
  env:
    - name: OTEL_LOGS_EXPORTER
      value: otlp
```

The [auto-instrumentation](../../how-to/auto-instrumentation.md) Java agent
bridges Logback/Log4j2 to OTel logs; when a log event carries a `Throwable`, the
appender attaches `exception.type/message/stacktrace` automatically. Spring Boot
and Ktor both use SLF4J + Logback by default, so logging the throwable is all you
need — no `logback.xml` change or extra dependency.

Log what escapes your handlers once, with the throwable. Spring — a
`@RestControllerAdvice`:

```kotlin
@RestControllerAdvice
class GlobalExceptionHandler {
    private val log = LoggerFactory.getLogger(javaClass)

    @ExceptionHandler(Exception::class)
    fun handle(e: Exception): ResponseEntity<String> {
        log.error("Unhandled exception", e)
        return ResponseEntity.internalServerError().body("Internal error")
    }
}
```

Ktor — the `StatusPages` plugin:

```kotlin
install(StatusPages) {
    exception<Throwable> { call, cause ->
        call.application.log.error("Unhandled exception", cause)
        call.respondText("Internal error", status = HttpStatusCode.InternalServerError)
    }
}
```

!!! note "Confirm your SLF4J binding"
    The agent can only bridge **Logback** or **Log4j2**. If your app uses a
    different SLF4J binding there is no appender to bridge and you'll stay in
    shape C. Logback is the Spring Boot and Ktor default, so most apps already
    have it.

### Node.js (Express / Next.js)

`runtime: nodejs` bundles the Winston and Pino instrumentations, whose
log-sending appenders map a logged `Error` onto `exception.*` for you:

```yaml title="nais.yaml"
spec:
  observability:
    autoInstrumentation:
      enabled: true
      runtime: nodejs
  env:
    - name: OTEL_LOGS_EXPORTER
      value: otlp
```

Log the `Error` object so the appender can read its name, message, and stack:

```javascript
// Pino: the Error under `err` → exception.type/message/stacktrace
logger.error({ behandlingId, err }, "Failed to fetch behandling");

// Winston: the Error passed alongside the message
// logger.error("Failed to fetch behandling", { behandlingId, err });
```

The four-argument Express **error-handling middleware** `(err, req, res, next)`,
registered after your routes, is the natural place to catch what escapes a route
(the same appender applies to Next.js route handlers and API routes):

```javascript
app.use((err, req, res, next) => {
    logger.error({ err }, "Unhandled error");
    res.status(500).send("Internal Server Error");
});
```

!!! note "Check your OpenTelemetry versions"
    The automatic `Error` → `exception.*` mapping needs OpenTelemetry JS
    `api-logs`/`sdk-logs` ≥ 0.212.0 (bundled by the platform `nodejs` agent). On
    older self-managed pins the `Error` is copied as a generic attribute instead,
    leaving you in shape B. You can always set it explicitly by passing the error
    as the log record's `exception` field via `@opentelemetry/api-logs`.

### Field mapping

What the app produces on the OTLP path, and how it lands in the Issues tab:

| OTel log attribute (semconv) | Loki structured metadata | Used by Issues for |
|------------------------------|--------------------------|--------------------|
| `exception.type` | `exception_type` | Grouping key + issue title; also gates a line into shape A |
| `exception.message` | `exception_message` | Grouping key + issue title |
| `exception.stacktrace` | `exception_stacktrace` | Stack trace shown in the issue |
| `k8s.pod.name` (resource attr) | `k8s_pod_name` | Pod impact count |

The Issues tab selects shape A with, in effect:

```logql
sum by (exception_type, exception_message) (
  count_over_time({service_name="<app>", service_namespace="<team>"} | exception_type != "" [$__range])
)
```

## Go

Go is a smaller slice of nais apps and largely the platform team's domain, so
briefly: Go uses `runtime: sdk` — no agent — so your app wires OpenTelemetry
itself. For the stdout path the same shape-B advice applies (structured JSON,
stable message, error as a field). For shape A you build a `LoggerProvider` with
the OTLP log exporter and the
[`otelslog`](https://pkg.go.dev/go.opentelemetry.io/contrib/bridges/otelslog)
bridge, then set the `exception.*` attributes yourself — the bridge does not map
errors, and because a Go `error` carries no stack, `exception.stacktrace` is
manual and weaker than the JVM's:

```go
slog.ErrorContext(ctx, "failed to fetch behandling",
    slog.String("behandlingId", behandlingId),
    slog.String("exception.type", fmt.Sprintf("%T", err)),
    slog.String("exception.message", err.Error()),
)
```

## Log the exception, not a bare message

Whichever path you're on, this is the single biggest reason backend Issues come
out thin: **hand the logging framework the throwable/error object, not a string
you built from it**, and keep the message stable.

### Log the object, never a pre-formatted string

**JVM (Kotlin)**

```kotlin
// BAD  — class and stack lost inside a string
log.warn("Failed to fetch behandling $behandlingId: ${e.message}")
// GOOD — stable message, throwable as the last arg, id as a field
log.warn("Failed to fetch behandling", kv("behandlingId", behandlingId), e)
```

**Node.js (Pino)**

```javascript
// BAD
logger.warn(`Failed to fetch behandling ${behandlingId}: ${err.message}`);
// GOOD
logger.warn({ behandlingId, err }, "Failed to fetch behandling");
```

### Don't log self-healing retries at error or warn

A message that logs on every retry and then recovers is still counted as an
Issue — often a *top* Issue — even though nothing was actually broken. Log
retries at `info`/`debug`, and only escalate to `error` when the **final**
attempt fails. For example, a client calling the Oppgave API:

```javascript
async function createOppgave(payload, attempts = 3) {
    for (let i = 1; i <= attempts; i++) {
        try {
            return await oppgaveClient.create(payload);
        } catch (err) {
            if (i === attempts) {
                // only the terminal failure becomes an Issue
                logger.error({ err, saksId: payload.saksId, attempts }, "Failed to create oppgave");
                throw err;
            }
            // transient, self-healing — not an Issue
            logger.debug({ saksId: payload.saksId, attempt: i }, "Oppgave call failed, retrying");
        }
    }
}
```

### Put context in fields, not in the message

Add identifiers and status as **structured fields** (`saksId`, `behandlingId`,
`journalpostId`, `oppgaveId`, `status`) rather than concatenating them into the
message. They become queryable, and — because grouping is on the message —
keeping variable data out of the message keeps one error from fragmenting into
dozens of near-duplicate Issues.

!!! danger "Never log personally identifying data"
    Do **not** put `fnr`/`personident`, names, addresses, or other directly
    identifying data into log messages or fields. Internal case identifiers like
    `saksId` / `behandlingId` are acceptable **only** when they don't themselves
    identify the user or leak personal data. When in doubt, leave it out.

## Verify it works

1. Trigger the exception in your app (dev is fine).
2. In [Grafana Explore](<<tenant_url("grafana", "explore")>>), pick your
   environment's Loki data source and check which shape you're in.

    **Shape B (stdout):**

    ```logql
    {service_name="<your-app>", service_namespace="<your-team>"} | json | detected_level=~"(?i)error"
    ```

    You should see your JSON body parsed, with a stable `message`/`msg` and — if
    you logged the object — a `stack_trace`/`stack` field.

    **Shape A (OpenTelemetry):**

    ```logql
    {service_name="<your-app>", service_namespace="<your-team>"} | exception_type != ""
    ```

    Expand a line — `exception_type`, `exception_message`, and
    `exception_stacktrace` should appear under **structured metadata** (not inside
    the log body). If they're there, you're in shape A.

3. Open your service's **Issues** tab in
   [Nais APM](<<tenant_url("grafana", "a/nais-apm-app")>>). Within a few minutes
   the exception should appear as a backend Issue.

If you're on stdout and one error fragments into near-duplicate Issues, your
message is carrying variable data — revisit
[step 2](#get-the-best-issues-over-stdout-shape-b).

## Known limitations and cost

- **Shape A needs OpenTelemetry today.** There is no way to reach shape A on the
  stdout path: fluentbit attaches only Kubernetes fields as structured metadata
  and never promotes app JSON fields like `exception_type`. A platform change —
  fluentbit promoting `exception.*`/`error.*` JSON fields to Loki structured
  metadata — would let stdout apps reach shape A without OTLP, but that is a
  **follow-up and not available today**.
- **Log duplication (OTLP).** Enabling `OTEL_LOGS_EXPORTER=otlp` does not stop
  your container writing to stdout, and fluentbit keeps shipping it — so each line
  can land in Loki twice, once from stdout and once over OTLP. Keep console
  logging lean if you turn it on.
- **A possible duplicate Issue (OTLP).** If your stdout logging is JSON *and* you
  enable OTLP export, the same exception can surface as **two** Issues: the rich
  shape-A Issue (from the OTLP copy) and a weaker message-only shape-B Issue (from
  the stdout JSON copy).

## Related

- [How issues are grouped](../reference/issues-model.md) — the fingerprint model
  behind the type + message grouping.
- [Auto-instrumentation reference](../../reference/auto-config.md) — the
  `OTEL_LOGS_EXPORTER` opt-in and other agent settings.
- [Loki labels reference](../../logging/reference/loki-labels.md) — what
  structured metadata is, and which fields are available.
- [Triage an issue](triage-an-issue.md) — acting on the issue once it's grouped.

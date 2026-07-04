---
title: Make database queries visible
description: >-
  The instrumentation the Nais APM Database tab needs — OpenTelemetry client
  spans with db.system, and connection-pool metrics for pool health.
tags: [how-to, observability, apm, database]
---

# Make database queries visible

The **Database** tab shows which database systems your service talks to, RED
metrics per operation (rate, errors, latency), and connection-pool health. It's
built entirely from telemetry your app emits — if the tab is empty, this is the
checklist to work through. Each item maps directly to what the tab reads.

## Requirements checklist

### 1. Database client spans

Your app must export **OpenTelemetry CLIENT-kind spans** for its database calls,
carrying the `db.system` attribute (and ideally `db.operation`).

Auto-instrumentation produces these **without code changes**:

- the **OTel Java agent** (JDBC, the MongoDB driver, Lettuce/Redis);
- **OTel Node.js** instrumentations (`pg`, `mysql2`, `mongodb`, `ioredis`);
- equivalents for Go and Python.

If your service already appears on the [Traces tab](../tutorials/get-started.md#5-drill-into-traces-and-logs)
with database spans, this part is done.

### 2. Span-metrics aggregation

Those spans must be aggregated into `traces_spanmetrics_*` metrics with
`db_system` as a dimension. This is **platform-side** (the Tempo
metrics-generator) and is usually already in place on Nais.

If the Traces tab shows database spans but the Database tab stays empty, this
aggregation pipeline is where to look.

### 3. Connection-pool metrics (for the pool panels only)

Pool health and connection-acquisition-time charts additionally need
`db.client.connections.*` metrics (`db_client_connections_*` in Prometheus).

The **OTel Java agent emits these out of the box for JDBC/HikariCP pools.**
Driver-managed pools (for example the MongoDB Java driver) and Oracle UCP are
**not surfaced here today.**

## What you'll see when it's partially instrumented

| You have | You see |
| -------- | ------- |
| Spans **and** pool metrics | Full Database tab — query analytics and pool health |
| Spans but no pool metrics | Query analytics; a note that pool metrics aren't detected |
| Pool metrics but no spans | Pool panels; a note that database spans aren't detected |
| Neither | The full requirements checklist above |

## Related

- [Automatic observability](../../README.md#automatic-observability) — how Nais
  injects OpenTelemetry agents.
- [Get started with auto-instrumentation](../../how-to/auto-instrumentation.md)

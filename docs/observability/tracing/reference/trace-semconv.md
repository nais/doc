---
tags: [reference, otel, observability, tracing]
---

# OpenTelemetry Trace Semantic Conventions

OpenTelemetry Semantic Conventions define a common set of attribute names for spans, so that traces from different languages and libraries can be queried and correlated consistently. This page lists the attributes you are most likely to encounter on traces collected by the Nais platform.

The full specification is maintained upstream at [opentelemetry.io](https://opentelemetry.io/docs/specs/semconv/general/trace/).

!!! note "Legacy attribute names"

    OpenTelemetry stabilized several attribute names over time. The auto-instrumentation agents on the platform still emit some of the older names — notably `http.status_code`, `db.statement`, and `db.operation` — alongside their stabilized replacements (`http.response.status_code`, `db.query.text`, and `db.operation.name`). When writing queries, be prepared to check for both the legacy and the stabilized attribute.

## Resource attributes

Resource attributes describe the entity producing the telemetry (your workload) and are attached to every span it emits.

| Attribute               | Description                                             | Example              |
| ----------------------- | ------------------------------------------------------- | -------------------- |
| `service.name`          | The name of the service (your application name).        | `my-app`             |
| `service.namespace`     | The namespace (team) the service is deployed in.        | `my-team`            |
| `k8s.cluster.name`      | The Kubernetes cluster hosting the workload.            | `prod-gcp`           |
| `telemetry.sdk.language`| The language of the SDK that produced the span.         | `java`               |

## HTTP attributes

Set on spans that represent HTTP server or client calls.

| Attribute                    | Status     | Description                                          | Example         |
| ---------------------------- | ---------- | ---------------------------------------------------- | --------------- |
| `http.request.method`        | Stable     | The HTTP request method.                             | `GET`           |
| `http.response.status_code`  | Stable     | The HTTP response status code.                       | `200`           |
| `http.route`                 | Stable     | The matched route (template), low cardinality.       | `/users/{id}`   |
| `url.path`                   | Stable     | The path component of the request URL.               | `/users/42`     |
| `url.full`                   | Stable     | The full request URL.                                | `https://…/users/42` |
| `server.address`             | Stable     | The address of the server handling the request.      | `api.example.com` |
| `http.status_code`           | Legacy     | Superseded by `http.response.status_code`.           | `200`           |

## Database attributes

Set on spans that represent calls to a database.

| Attribute            | Status | Description                                              | Example              |
| -------------------- | ------ | -------------------------------------------------------- | -------------------- |
| `db.system`          | Stable | The database management system.                          | `postgresql`         |
| `db.namespace`       | Stable | The name of the database being accessed.                 | `orders`             |
| `db.operation.name`  | Stable | The database operation being executed.                   | `SELECT`             |
| `db.query.text`      | Stable | The database statement being executed.                   | `SELECT * FROM …`    |
| `db.name`            | Legacy | Superseded by `db.namespace`.                            | `orders`             |
| `db.operation`       | Legacy | Superseded by `db.operation.name`.                       | `SELECT`             |
| `db.statement`       | Legacy | Superseded by `db.query.text`.                           | `SELECT * FROM …`    |

## Messaging attributes

Set on spans that represent producing or consuming messages (e.g. Kafka).

| Attribute                     | Description                                        | Example                |
| ----------------------------- | -------------------------------------------------- | ---------------------- |
| `messaging.system`            | The messaging system.                              | `kafka`                |
| `messaging.destination.name`  | The topic or queue name.                           | `my-team.some-topic`   |
| `messaging.operation`         | The operation performed on the message.            | `publish`              |
| `messaging.kafka.message.key` | The Kafka message key.                             | `order-42`             |

!!! warning "Sensitive data"

    Some of these attributes (for example `url.path`, `db.statement`, and `messaging.kafka.message.key`) can contain user data. See [Sensitive data](../README.md#sensitive-data) for what to check in your application.

## Attribute names in span metrics

When trace attributes are turned into [span metrics](span-metrics.md), Prometheus replaces every `.` (dot) in the attribute name with an `_` (underscore) — for example `http.response.status_code` becomes the `http_response_status_code` label.

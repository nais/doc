---
description: PromQL reference documentation for querying metrics in Prometheus.
tags: [reference, prometheus, metrics]
---

# PromQL Reference

PromQL is a query language for Prometheus monitoring system. It allows you to select and aggregate time series data in real time. PromQL is used to [create dashboards in Grafana][howto-grafana-dashboard], and to [create alerts with Alertmanager][howto-alertmanager-alerts].

[howto-grafana-dashboard]: ../how-to/dashboard.md
[howto-alertmanager-alerts]: ../../alerting/how-to/prometheus-basic.md

## Basic Syntax

A basic PromQL query can be as simple as a metric name: `http_requests_total`. This will return the current value of the `http_requests_total` metric.

## Data Types

PromQL supports a variety of data types:

- Scalars: `1`, `3.14`, `0.5`
- Strings: `"hello"`, `"world"`
- Vectors: `http_requests_total{job="api-server"}`
- Range Vectors: `http_requests_total{job="api-server"}[5m]`

## Operators

PromQL supports a variety of operators:

- Arithmetic: `+`, `-`, `*`, `/`, `%`, `^`
- Comparison: `==`, `!=`, `>`, `<`, `>=`, `<=`
- Logical: `and`, `or`, `unless`

## Functions

PromQL includes a variety of functions, such as:

- `rate(v range-vector)`: calculates the per-second average rate of time series in a range vector
- `sum(v vector)`: calculates the sum of all values in the vector
- `avg(v vector)`: calculates the average of all values in the vector

## Aggregation

PromQL allows you to aggregate time series: `sum(http_requests_total) by (status)`. This will return the sum of `http_requests_total` for each `status` label value.

## More Information

For more detailed information, refer to the [official PromQL documentation][prometheus-querying-basics] and the [example Prometheus queries][prometheus-example-queries].

[prometheus-querying-basics]: https://prometheus.io/docs/prometheus/latest/querying/basics/
[prometheus-example-queries]: https://prometheus.io/docs/prometheus/latest/querying/examples/

---
description: Expose metrics from your application
tags: [guide]
---
# Expose metrics from your application

This guide will show you how to expose metrics from your application, and how to configure Prometheus to scrape them.

See further [explanations on metrics](../../../explanation/observability/metrics.md) for more details

## 1. Add metric to your application

Most languages have a Prometheus client library available. See [Prometheus client libraries](https://prometheus.io/docs/instrumenting/clientlibs/) for a list of available libraries. These libraries provides examples as to how to instrument your application using the correct metric types.

Once instrumented, your application must serve these metrics using HTTP on a given `path` (e.g. `/metrics`).

## 2. Enable metrics in [manifest](../../../reference/application-spec.md)

```yaml
spec:
  prometheus:
    enabled: true
    path: /metrics
```

Once this manifest is deployed, Prometheus will start scraping your application for metrics on the provided `path`.


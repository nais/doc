---
description: >-
  Application Performance Monitoring or tracing using Grafana Tempo on NAIS.
tags: [explanation, observability, tracing]
---

# Tracing

[Traces](https://en.wikipedia.org/wiki/Observability_(software)#Distributed_traces) are a record of the path a request takes through your application. They
are useful for understanding how a request is processed in your application.

NAIS does not collect trace data automatically. If you want tracing integration,
you must first instrument your application to collect traces, and then configure
the tracing library to send it to the correct place.

Traces from NAIS applications are collected using the [OpenTelemetry](https://opentelemetry.io/) standard.
Performance metrics are stored and queried from the [Tempo](https://grafana.com/oss/tempo/) component.


## Visualizing application performance

Visualization of traces can be done in [the new Grafana installation](https://grafana.<<tenant()>>.cloud.nais.io).

You can use the **Explore** feature of Grafana with the _prod-gcp-tempo_ and _dev-gcp-tempo_ data sources.

There are no ready-made dashboards at this point, but feel free to make one yourself and contribute to this page.

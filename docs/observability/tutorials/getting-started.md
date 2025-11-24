---
title: Getting Started with Observability in Nais
tags: [tutorial, observability, getting-started]
---

# Getting Started with Observability in Nais

This tutorial will guide you through the process of enabling observability for your application on Nais, using OpenTelemetry and the Grafana stack (Loki, Tempo, Prometheus, Grafana).

## Prerequisites

- A Nais application deployed to a cluster
- Access to your team's Grafana instance

## 1. Enable Auto-Instrumentation

The easiest way to get started is to enable [auto-instrumentation](../how-to/auto-instrumentation.md) in your `nais.yaml`:

```yaml
spec:
  observability:
    autoInstrumentation:
      enabled: true
```

Deploy your application with this configuration. Nais will automatically inject OpenTelemetry agents for supported languages.

## 2. View Metrics in Grafana

Once your app is running, metrics will be available in Prometheus and visualized in Grafana.

- Go to your [Grafana dashboard](https://grafana.nais.io/)
- Use the Prometheus data source to query your application's metrics
- Explore default dashboards or create your own

## 3. View Logs in Grafana Loki and Team Logs

- Logs sent to `stdout`/`stderr` are automatically collected by Loki
- For private logs, configure [Team Logs](../logging/how-to/team-logs.md)
- In Grafana, use the Loki or Team Logs data source to search and analyze logs

## 4. View Traces in Grafana Tempo

- Traces are collected via OpenTelemetry and sent to Tempo
- In Grafana, use the Tempo data source to view traces for your application
- You can correlate traces with logs and metrics for full observability

## Next Steps

- [Instrument your application with OpenTelemetry SDK](opentelemetry-instrumentation.md)
- [Create custom metrics](../metrics/how-to/expose.md)
- [Set up alerting](../alerting/README.md)

Congratulations! You now have end-to-end observability for your Nais application.

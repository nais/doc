---
tags: [reference, grafana, metrics]
---

# Grafana Glossary

This glossary contains terms and concepts related to Grafana.

## Dashboard

A dashboard is a collection of panels arranged in a grid layout. Each panel is a single visualization or a single query result. You can add multiple panels to a dashboard to create a complete view of your application.

* [Guide: Create a dashboard in Grafana](../how-to/dashboard.md)
* [Grafana docs: Dashboards](https://grafana.com/docs/grafana/latest/dashboards/)

## Panel

A panel is a single visualization or a single query result. You can add multiple panels to a dashboard to create a complete view of your application.


## Data source

A data source is a source of data that you can query in Grafana. Grafana supports a variety of data sources, including Prometheus (metrics), Tempo (traces), and Loki (logs).

* [Grafana docs: Data sources](https://grafana.com/docs/grafana/latest/datasources/)

## Query

A query is a request for data from a data source. In Grafana, you can write queries to visualize your metrics, logs, and traces.

## Visualization

A visualization is a graphical representation of your data. Grafana supports a variety of visualizations, including graphs, tables, and heatmaps.

* [Grafana docs: Panels and visualizations](https://grafana.com/docs/grafana/latest/panels-visualizations/)

## Alerting

Grafana has a built-in alerting system that allows you to set up alerts for your metrics. You can create alert rules that are evaluated at regular intervals, and when the alert rule conditions are met, Grafana will send notifications to the configured notification channels.

* [Guide: Alerting in Grafana](../../alerting/how-to/grafana.md)

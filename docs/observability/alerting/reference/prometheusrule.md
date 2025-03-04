---
description: PrometheusRule resource specification for defining alerts in Prometheus.
tags: [reference, observability, alerting, prometheus]
---

# Prometheus Alerting Rule Reference

[Prometheus alerts][prometheus-alerting-rule] are defined in a `PrometheusRule` resource. This resource is part of the [Prometheus Operator][prometheus-operator] and is used to define alerts that should be sent to the Alertmanager.

[Alertmanager][alertmanager] is a component of the Prometheus project that handles alerts sent by client applications such as the Prometheus server. It takes care of deduplicating, grouping, and routing them to the correct Slack channel.

Prometheus alerts are defined using the [PromQL](../../metrics/reference/promql.md) query language. The query language is used to specify when an alert should fire, and the `PrometheusRule` resource is used to specify the alert and its properties.

Prometheus alerts are sent to the team's Slack channel configured in [Nais Console](../../../operate/console.md) when the alert fires.

```mermaid
graph LR
  alerts.yaml --> Prometheus
  Prometheus --> Alertmanager
  Alertmanager --> Slack
```

[prometheus-operator]: https://github.com/prometheus-operator/prometheus-operator
[alertmanager]: https://prometheus.io/docs/alerting/latest/alertmanager/
[prometheus-alerting-rule]: https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/

## `PrometheusRule`

??? note ".nais/alert.yaml"

    ```yaml
    apiVersion: monitoring.coreos.com/v1
    kind: PrometheusRule
    metadata:
      labels:
        team: my-team
      name: my-alerts
      namespace: my-team
    spec:
      groups:
      - name: my-app-client-errors
        rules:
          - alert: HttpClientErrorRateHigh
            expr: |
              1 - (
                sum(
                  rate(
                    http_client_request_duration_seconds_count{app="my-app", http_response_status_code="200"}[5m]
                  )
                ) by (server_address)
                /
                sum(
                  rate(
                    http_client_request_duration_seconds_count{app="my-app"}[5m]
                  )
                ) by (server_address)
              ) * 100 < 95
            for: 10m
            annotations:
              summary: "High error rate for outbound http requests"
              consequence: "Users are experiencing errors when using the application."
              action: "Check the logs using `kubectl logs` for errors and check upstream services."
              message: "Requests to `{{ $labels.server_address }}` are failing at {{ $value }}% over the last 5 minutes."
              runbook_url: "https://github.com/navikt/my-app-runbook/blob/main/HttpClientErrorRateHigh.md"
              dashboard_url: "https://grafana.nav.cloud.nais.io/d/000000000/my-app"
            labels:
              severity: warning
              namespace: my-team
    ```

### `groups[]`

A `PrometheusRule` can contain multiple groups of rules. Each group can contain multiple alert rules.

#### `groups[].name`

The name of the group. This is used to group alerts in the Alertmanager.

#### `groups[].rules[]`

##### `groups[].rules[].alert`

The name of the alert. This is used to identify the alert in the Alertmanager. Typically this is a short, descriptive name on the form `CamelCase`.

##### `groups[].rules[].expr`

The expression that defines when the alert should fire. This is a PromQL expression that should evaluate to `true` when the alert should fire.

We suggest using the Explore page in Grafana to build and test your PromQL expressions before creating a `PrometheusRule`.

##### `groups[].rules[].for`

For how long time the `expr` must evaluate to `true` before firing the alert. This is used to prevent flapping alerts and alerting on temporary spikes in metrics.

When the `expr` first evaluates to `true` the alert will be in `pending` state for the duration specified.

Example values: `30s`, `5m`, `1h`.

##### `groups[].rules[].labels`

Labels to attach to the alert. These are used to group and filter alerts in the Alertmanager.

###### `groups[].rules[].labels.severity` (required)

This will affect what color the notification gets. Possible values are `critical` (🔴), `warning` (🟡) and `info` (🟢).

###### `groups[].rules[].labels.namespace` (required)

The team that is responsible for the alert. This is used to route the alert to the correct Slack channel.

###### `groups[].rules[].labels.send_resolved` (optional)

If set to `false`, no resolved message will be sent when the alert is resolved. This is useful for alerts that are not actionable or where the resolved message is not needed.

##### `groups[].rules[].annotations`

###### `groups[].rules[].annotations.summary` (optional)

The summary annotation is used to give a short description of the alert. This is useful for the one receiving the alert to understand what the alert is about and is the first line in the alert message in Slack.

###### `groups[].rules[].annotations.consequence` (optional)

The consequence annotation is used to describe what happens in the world when this alert fires. This is useful for the one receiving the alert to understand the impact of the alert.

###### `groups[].rules[].annotations.action` (optional)

The action annotation is used to describe what the best course of action is to resolve the issue. Good alerts should have a clear action that can be taken to resolve the issue.

###### `groups[].rules[].annotations.message` (optional)

The message annotation is used to give a more detailed description of the alert. This is useful for the one receiving the alert to understand the alert in more detail and will printed for each result in the alert expression.

###### `groups[].rules[].annotations.runbook_url` (optional)

The runbook URL annotation is used to link to a runbook that describes how to resolve the issue. This is useful for the one receiving the alert to quickly find the information needed to resolve the issue and is added as a link in the alert message in Slack.

[:octicons-link-external-24: Learn more about runbooks](https://www.atlassian.com/software/confluence/templates/devops-runbook).

###### `groups[].rules[].annotations.dashboard_url` (optional)

The dashboard URL annotation is used to link to a dashboard that can help diagnose the issue. This is useful for the one receiving the alert to quickly find the information needed to diagnose the issue and is added as a link in the alert message in Slack.

[:bulb: Create a dashboard in Grafana](../../metrics/how-to/dashboard.md)

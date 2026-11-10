---
description: Learn how to create an alert for your application in Grafana.
tags: [how-to, observability, alerting, grafana]
---

# Create alert in Grafana

<iframe title="vimeo-player" src="https://player.vimeo.com/video/720001934?h=b3e8e3257b" width="100%" height="360" frameborder="0" allowfullscreen></iframe>

This guide shows you how to create an alert for your application in Grafana. While we recommend [creating alerts in Prometheus][howto-prometheus-alert], Grafana can in some cases be a more user-friendly alternative.

[howto-prometheus-alert]: ./prometheus-basic.md

## Prerequisites

You will need to have an application that exposes metrics. If you don't have one, you can follow the [Instrument Your Application][howto-instrument-application] guide.

You will need some basic knowledge of [PromQL](../../metrics/reference/promql.md) to create alert conditions.

Configure your team's Slack alert channel for the target environment in
[Nais Console](../../../operate/console/README.md). Nais automatically creates
your team's Grafana folder, Slack contact points, and notification policies
with routes for the configured environments. You do not need to create these
resources manually.

[howto-instrument-application]: ../../metrics/how-to/expose.md

## Create a new Alert rule

1. Open [Grafana](<<tenant_url("grafana")>>) and navigate to "Alerting" > "[Alert rules](<<tenant_url("grafana", "alerting/list")>>)" in the left-hand menu.
2. Click on "+ New alert rule" button.
3. Give your alert a descriptive name, you will choose a folder for it later.

## Define query and alert condition

Define queries and/or expressions and then choose one of them as the alert rule condition. This is the threshold that an alert rule must meet or exceed in order to fire.

1. In the "Query" section, select the data source that contains the metric you want to alert on.
2. Write a PromQL query that returns the metric you want to alert on. For example, `http_requests_total{}`.
3. In the "Expression" field, write the condition that should trigger the alert. Choose the operator and the threshold value. For example, `IS ABOVE 100`.

## Set evaluation behavior

Define how the alert rule is evaluated.

1. Select your team's folder in the "Folder" dropdown.
2. Leave "Evaluation group" empty unless you want to group this alert with others.
3. Set "Pending period" to the amount of time the alert condition must be met before the alert is triggered.

## Add annotations

Add annotations to provide more context in your alert notifications.

1. Add a summary for the alert.
2. Add a description for the alert (optional).
3. In the runbook URL, add a link to the runbook that describes how to resolve the alert (optional)
4. Link a dashboard to the alert to get image snapshots in the notification (optional).
5. Add the following custom annotations:
    * `action` - Describes the action that should be taken when the alert is triggered.
    * `consequence` - Describes the observed consequence from the user's perspective.

## Configure notifications

1. Add the required routing labels:
    * `team` - Your team's name in Nais Console.
    * `env` - The environment name in Nais Console.
2. Add `severity` (`critical`, `warning`, or `info`) and, optionally, `app`
   for the application name.
   {% if tenant() == "nav" %}
   If you use a
   [Nais APM template](../../apm/how-to/create-alerts.md#the-templates), review
   its default severity and change it to match your team's needs.
   {% endif %}
3. Leave direct contact-point selection unset so Grafana uses the
   automatically managed notification policies.
4. Use **Preview routing** to verify that the labels select the contact point
   for your team's intended environment, then save the rule.

{% if tenant() == "nav" %}
For NAV Cloud production alerts, use `env=prod-gcp`, even though the data
environment in Nais APM is `prod`.
[Nais APM templates](../../apm/how-to/create-alerts.md) fill in the mapped
routing label for you.
{% endif %}

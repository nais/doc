---
description: something something about Alerts spec
---

# Spec

## `metadata.name`

Name for the group of alerts, can be the same as the name of your app.

**Required**: `true`

**Allowed values**: `[a-z]*`

## `metadata.labels.team`

The name of the [team](../../basics/teams.md) that owns this application \(lowercase only!\).

**Required**: `true`

**Allowed values**: `[a-z]*`

## `spec.route`

Let you configure some of the configurations in the `route`-config.

### `spec.route.groupWait`

How long to initially wait to send a notification for a group of alerts.
Allows to wait for an inhibiting alert to arrive or collect more initial alerts for the same group. 
(Usually ~0s to few minutes.)

### `spec.route.groupInterval`

How long to wait before sending a notification about new alerts that are added to a group of alerts for which an initial notification has already been sent.
(Usually ~5m or more.)

### `spec.route.repeatInterval`

How long to wait before sending a notification again if it has already been sent successfully for an alert.
(Usually ~3h or more).

## `spec.receivers`

A list of notification recievers. You can use one or more of: e-mail or slack. There needs to be at least one receiver.

**Required**: `true`

### `spec.receivers.slack`

Slack notifications are sent via Slack webhooks.

#### `spec.receivers.slack.channel`

The channel or user to send notifications to. Can be specified with and without `#`.

**Required**: `true`

#### `spec.receivers.slack.prependText`

Text to prepend every Slack message with severity `danger`

### `spec.receivers.email`

Be alerted via email.

#### `spec.receivers.email.to`

The email address to send notifications to.

**Required**: `true`

#### `spec.receivers.email.send_resolved`

Whether or not to notify about resolved alerts.

**Default**: `false`

**Allowed values**: `true|false`

### `spec.receivers.sms`

Be alerted via SMS.

#### `spec.receivers.sms.recipients`

The recipients that should recieve SMS about alerts

**Required**: `true`

#### `spec.receivers.sms.send_resolved`

Whether or not to notify about resolved alerts.

**Default**: `false`

**Allowed values**: `true|false`

## `spec.alerts[]`

A list of alerts.

**Required**: `true`

### `spec.alerts[].alert`

The name of the alert.

**Required**: `true`

### `spec.alerts[].description`

Simple description of the triggered alert.

### `spec.alerts[].expr`

Prometheus expression that triggers an alert.

**Required**: `true`

### `spec.alerts[].for`

Duration before the alert should trigger.

**Required**: `true`

**Allowed values**: `^\d+[smhdwy]$`

**Examples**

`for: 1s` 1 second duration before alert triggers

`for: 10m` 10 minutes duration before alert triggers

### `spec.alerts[].action`

What human actions are needed to resolve or investigate this alert.

**Required**: `true`

### `spec.alerts[].documentation`

URL for documentation for this alert.

### `spec.alerts[].sla`

Time before the alert should be resolved.

### `spec.alerts[].severity`

Alert level for Slack messages.

**Default**: `danger`

**Allowed values**: `good|warning|danger|#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})` where the latter is the hex code for wanted color on Slack message

**Examples**

`severity: good` will result in green message.

`severity: #808000` will result in an olive colored message.

## `spec.inhibitRules[]`

A list of inhibit rules. Read more about it at [prometheus.io/docs](https://prometheus.io/docs/alerting/configuration/#inhibit_rule).

## `spec.inhibitRules[].targets`

Matchers that have to be fulfilled in the alerts to be muted. These are key/value pairs.

## `spec.inhibitRules[].targetsRegex`

Matchers that have to be fulfilled in the alerts to be muted. These are key/value pairs, where the value can be a regex.

## `spec.inhibitRules[].sources`

Matchers for which one or more alerts have to exist for the inhibition to take effect. These are key/value pairs.

## `spec.inhibitRules[].sourcesRegex`

Matchers for which one or more alerts have to exist for the inhibition to take effect. These are key/value pairs, where the value can be a regex.

## `spec.inhibitRules[].labels[]`

Labels that must have an equal value in the source and target alert for the inhibition to take effect. These are string arrays.


---
description: something something about Alerts spec
---

# Spec

## `metadata.name`

Name for the group of alerts, can be the same as the name of your app.

**Required**: `true`

## `metadata.labels.team`

The name of the [team](../../basics/teams.md) that owns this application \(lowercase only!\).

**Required**: `true`

## `spec.receivers`

A list of notification recievers. You can use one or more of: e-mail, or slack. There needs to be at least one receiver.

**Required**: `true`

### `spec.receivers.slack`

Slack notifications are sent via Slack webhooks.

#### `spec.receivers.slack.channel`

The channel or user to send notifications to.

**Required**: `true`

#### `spec.receivers.slack.preprend_text`

Text to prepend every Slack message with severity `danger`

### `spec.receivers.email`

Be alerted via email.

#### `spec.receivers.to`

The email address to send notifications to.

**Required**: `true`

#### `spec.receivers.email.send_resolved`

Whether or not to notify about resolved alerts.

**Default**: `false`

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

### `spec.alerts[].action`

What human actions are needed to resolve, or investigate this alert.

**Required**: `true`

### `spec.alerts[].documentation`

URL for docmentation for this alert.

### `spec.alerts[].sla`

Time before the alert should be resolved.

### `spec.alerts[].severity`

Alert level for Slack messages.

**Default**: `danger`


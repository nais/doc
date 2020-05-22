---
description: something something about Alerts spec
---
# Alert spec

## `metadata.name`
Name for the group of alerts, can be the same as the name of your app.

**Required**: `true`

**Allowed values**: `[a-z]*`

## `metadata.labels.team`
The name of the [team](../../basics/teams.md) that owns this application (lowercase only!).

**Required**: `true`

**Allowed values**: `[a-z]*`

## `spec.receivers`
A list of notification recievers. You can use one or more of: e-mail or slack. There needs to be at least one receiver.

**Required**: `true`

### `spec.receivers.slack`
Slack notifications are sent via Slack webhooks.

#### `spec.receivers.slack.channel`
The channel or user to send notifications to.

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

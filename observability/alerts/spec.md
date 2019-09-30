---
description: something something about Alerts spec
---
# Alert spec

## `metadata`
Required: `true`

### `metadata.name`
Required: `true`  
Description: Name for the group of alerts, can be the same as the name of your app

### `metadata.labels`
Required: `true`

#### `metadata.labels.team`
Required: `true`  
Description: [mailnick/tag](../../basics/teams.md)


## `spec`

### `spec.receivers`
Required: `true`  
Description: You need at least one receiver

#### `spec.receivers.slack`

##### `spec.receivers.slack.channel`
Required: `true`  
Description: Slack channel to send notifications to

##### `spec.receivers.slack.preprend_text`
Description: Text to prepend every Slack message with severity `danger`

#### `spec.receivers.email`

##### `spec.receivers.to`
Required: `true`  
Description: The email address to send notifications to

##### `spec.receivers.email.send_resolved`
Default: `false`  
Description: Whether or not to notify about resolved alerts

### `spec.alerts[]`
Required: `true`  
Description: A list of alerts

#### `spec.alerts[].alert`
Required: `true`  
Description: The title of the alerts

#### `spec.alerts[].description`
Description: Simple description of the triggered alert

#### `spec.alerts[].expr`
Required: `true`  
Description: Prometheus expression that triggers an alert
 
#### `spec.alerts[].for`
Required: `true`  
Description: Duration before the alert should trigger

#### `spec.alerts[].action`
Required: `true`  
Description: How to resolve this alert

#### `spec.alerts[].documentation`
Description: URL for docmentation for this alert

#### `spec.alerts[].sla`
Description: Time before the alert should be resolved

#### `spec.alerts[].severity`
Default: `danger`  
Description: Alert level for Slack messages

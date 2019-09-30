# Spec

## metadata
Key: `metadata`  
Required: `true`

### name
Key: `metadata.name`  
Required: `true`  
Description: Name for the group of alerts, can be the same as the name of your app

### labels
Key: `metadata.labels`  
Required: `true`

#### team
Key: `metadata.labels.team`  
Required: `true`  
Description: [mailnick/tag](../../basics/teams.md)

---


| Parameter | Description | Default | Required |
| :--- | :--- | :--- | :---: |
| metadata.name | Name for the group of alerts |  | x |
| metadata.labels.team | [mailnick/tag](../../basics/teams.md) |  | x |
| spec.receivers | You need at least one receiver |  | x |
| spec.receivers.slack.channel | Slack channel to send notifications to |  |  |
| spec.receivers.slack.preprend\_text | Text to prepend every Slack message with severity `danger` |  |  |
| spec.receivers.email.to | The email address to send notifications to |  |  |
| spec.receivers.email.send\_resolved | Whether or not to notify about resolved alerts |  | false |
| spec.alerts\[\].alert | The title of the alerts |  | x |
| spec.alerts\[\].description | Simple description of the triggered alert |  |  |
| spec.alerts\[\].expr | Prometheus expression that triggers an alert |  | x |
| spec.alerts\[\].for | Duration before the alert should trigger |  | x |
| spec.alerts\[\].action | How to resolve this alert |  | x |
| spec.alerts\[\].documentation | URL for docmentation for this alert |  |  |
| spec.alerts\[\].sla | Time before the alert should be resolved |  |  |
| spec.alerts\[\].severity | Alert level for Slack messages | danger |  |

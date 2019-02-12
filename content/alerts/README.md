Alerts
======

We use [Prometheus](https://prometheus.io/) to collect metrics, and can trigger alerts based on these metrics. Custom alerts are specified in theire own Kubernetes-resource called `alerts`. We have made our own operator called [Alerterator](https://github.com/nais/alerterator), meaning that you can manage your alerts with `kubectl`, and that alerts are not tied to a specific app or namespace. This gives you more freedom to set up the necessary alerts for one or several apps. You can even make your own personal alert-profile.


## Custom alerts

Below you can find an example for a custom alert, check out a complete example in [alerterator-repo](https://github.com/nais/alerterator/blob/master/example/max_alerts.yaml):

```yaml
---
apiVersion: "nais.io/v1alpha1"
kind: "Alert"
metadata:
  name: nais-testapp
  namespace: default
  labels:
    team: aura
spec:
  receivers: # receivers for all alerts below
    slack:
      channel: '#teambeam-alerts-dev'
      prependText: '<!here> | ' # this text will be prepended to the Slack alert title
alerts:
  - description: nais-testapp unavailable
    expr: 'kube_deployment_status_replicas_unavailable{deployment="app-name"} > 0'
    for: 2m
    action: Read app logs(kubectl logs appname). Read Application events (kubectl descibe deployment appname) 
    documentation: https://github.com/navikt/aura-doc/naisvakt/alerts.md#app_unavailable
    sla: respond within 1h, during office hours
    severity: critical
```


### Fields/spec


| Parameter | Description | Default | Required |
| --------- | ----------- | ------- | :--------: |
| metadata.name | Name for the group of alerts | | x |
| metadata.labels.team | [mailnick/tag](https://github.com/nais/doc/blob/master/content/getting-started/teamadministration.md) | | x |
| spec.receivers | You need at least one receiver | | x |
| spec.receivers.slack.channel | Slack channel to send notifications to | | |
| spec.receivers.slack.preprend_text | Text to prepend every Slack-message (for ex. <!here> which represent @here) | | |
| spec.receivers.email.to | The email address to send notifications to| | |
| spec.receivers.email.send_resolved | Whether or not to notify about resolved alerts | | false |
| spec.alerts[].description | Simple description of the triggered alert | | x |
| spec.alerts[].expr | Prometheus expression that triggers an alert | | x |
| spec.alerts[].for | Duration before the alert should trigger | | x |
| spec.alerts[].action | How to resolve this alert | | x |
| spec.alerts[].documentation | URL for docmentation for this alert| | |
| spec.alerts[].sla | Time before the alert should be resolved| | |
| spec.alerts[].severity | Alert level for Slack-messages| | Error |



#### Writing the `expr`

In order to minimize the feedback loop we suggest experimenting with Prometheus-server to find the right metric for your alert, and the tresholds. The Prometheus server can be found in each [cluster](/README.md#clusters), at `https://prometheus.{cluster.domain}` (i.e. https://prometheus.nais.preprod.local).

You can also visit the Alertmanager at `https://alertmanager.{cluster.domain}` (i.e. https://alertmanager.nais.preprod.local).


### Tips

You can also use `annotations` and `labels` from the Prometheus-`expr` result.

For example:
```
{{ $labels.node }} is marked as unschedulable
```

turns into the following when posted to Slack/email:
```
b27apvl00178.preprod.local is marked as unschedulable
```


## Migrating from Naisd

It's pretty straight forward to move alerts from Naisd to Alerterator, and the most notable difference is the removal of name/alert and that annotation-fields has been move to the top-level.

```
alerts:
- alert: appNotAvailable
  expr: kube_deployment_status_replicas_unavailable{deployment="app-name"} > 0
  for: 5m
  annotations:
    action: Read app logs(kubectl logs appname). Read Application events (kubectl descibe deployment appname)
    severity: Warning
```

should be transformed to

```
alerts:
- expr: kube_deployment_status_replicas_unavailable{deployment="app-name"} > 0
  for: 5m
  description: It looks like the app is down
  action: Read app logs(kubectl logs appname). Read Application events (kubectl descibe deployment appname)
  severity: Warning
```

Check out the complete [spec](/#spec) for more information about the different keys.


## Flow

![Prometheus Server \<-- Prometheus Alertmanager](/content/_media/prometheus_alertmanager_overview.png)

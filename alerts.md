# Alerts
We use prometheus to collect metrics, and trigger alerts based on these metrics. Your app will get some set of default alerts but it is also
possible to create your own alerts in nais.yaml

Example alert:
```yaml
alerts:
- alert: appNameNotDeployed
  expr: kube_deployment_status_replicas_unavailable{deployment="app-name"} > 0
  for: 5m
  labels:
    severity: Warning
  annotations:
    action: Deploy your application
```
`alert`, `expr`, `for`, and `annotations[action]` are required.


## Required fields
| Field  | Explanation                                                                            |
| ------ | -------------------------------------------------------------------------------------- |
| alert  | Name of the alert (shows up in Slack), automatically prefixed with `teamname_appname-` |
| expr   | Prometheus expression that must evaluate to true for alert to fire                     |
| for    | Duration the alert has to be "firing" in order to alert                                |
| action | Text describing what should be done abount the alert. Will show in Slack               |


## Writing the `expr`
In order to minimize feedback loop we suggest experimenting with prometheus-server to find the right metric for your alert, and the
tresholds. Prometheus server can be found in reach cluster, at `https://prometheus.{cluster.domain}` (i.e.
https://prometheus.nais.preprod.local)


## Receiving alerts
Every app running on nais must have a team associated with it. The team can be set in the manifest.
```
team: teamName
```

The Slack channel associated with each team is mapped in prometheus-alertmanager.
It can be located at `https://alertmanager.{cluster.domain}` (i.e. https://alertmanager.nais.preprod.local)
The actual mapping is located [here](https://github.com/navikt/nais-yaml/blob/master/vars/cm-nais-prometheus-prometheus-alertmanager.yaml)

## Flow
![Prometheus Server \<-- Prometheus Alertmanager](./_media/Prometheus_Alertmanager.svg)

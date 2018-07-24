Alerts
======

We use [Prometheus](https://prometheus.io/) to collect metrics, and can trigger alerts based on these metrics. Custom alerts can be specified in the [NAIS manifest](/contracts/README.md#nais-manifest).


## Custom alerts

Below you can find an example for a custom alert defined in the [NAIS manifest](/contracts/README.md#nais-manifest):

```yaml
alerts:
- alert: appNotDeployed
  expr: kube_deployment_status_replicas_unavailable{deployment="app-name"} > 0
  for: 5m
  annotations:
    action: Application is not deployed
  labels:
    severity: Warning
```


## Fields

### Required

| Field               | Explanation                                                                             |
| ------------------- | --------------------------------------------------------------------------------------- |
| alert               | Name of the alert (shows up in Slack), automatically prefixed with `namespace-appname_` |
| expr                | Prometheus expression that must evaluate to true for alert to fire                      |
| for                 | Duration the alert has to be "firing" in order to notify                                |
| annotations[action] | Text describing what should be done about the alert. Will show in Slack                 |


### Optional

| Field | Explanation                                      |
| ----- | ------------------------------------------------ |
| annotations[description] | Additional text sent to Slack |
| labels[]                 | List of filterable tags       |


### Writing the `expr`

In order to minimize the feedback loop we suggest experimenting with Prometheus-server to find the right metric for your alert, and the tresholds. The Prometheus server can be found in each [cluster](/README.md#clusters), at `https://prometheus.{cluster.domain}` (i.e. https://prometheus.nais.preprod.local).


## Receiving alerts

Every app running on NAIS must have a team associated with it. The team needs to be set in the [NAIS manifest](/contracts/README.md#nais-manifest).

```
team: teamName
```

The Slack channel associated with each team is mapped in the Prometheus-alertmanager tool. To set up a new team you need to add it in the [nais-yaml](https://github.com/navikt/nais-yaml) Github-repo, under `vars/{cluster-domain}/nais-prometheus.yaml`.

For example:
```yaml
teams:
- name: aura
  slack: '#nais-alerts-dev'
- name: integrasjon
  slack: '#int-alerts-dev'
```

Just add a new line with `name`, and `slack`-channel.

You can also visit the alert manager at `https://alertmanager.{cluster.domain}` (i.e. https://alertmanager.nais.preprod.local).


## Flow

![Prometheus Server \<-- Prometheus Alertmanager](/_media/prometheus_alertmanager_overview.png)

# Alerts

If your application is [serving metrics](./metrics.md), you can create alerts to notify your team when something happens. The team is notified in the Slack channel specified in [Console](https://console.nav.cloud.nais.io)

You can define alerts by using Kubernetes resources (`PrometheusRule`), as well as directly in Grafana (GUI based).

You will have a separate alertmanager for each environment available at `https://alertmanager.<environment>.nav.cloud.nais.io/`

## Kubernetes resources

We use native [Prometheus alert rules](https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/), and let [Alertmanager](https://prometheus.io/docs/alerting/latest/alertmanager/) handle the notifications.

You can define alerts by creating a `PrometheusRule` resource in your teams namespace.

```yaml
---
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: my-alert
  namespace: <team namespace>
  labels:
    team: <team>
spec:
  groups:
  - name: my-alert
    rules:
    - alert: InstanceDown
      expr: kube_deployment_status_replicas_available{namespace="<namespace>", deployment="<application name>"} == 0
      for: 5m
      annotations:
        consequence: Application is unavailable
        action: "`kubectl describe pod <podname>` -> `kubectl logs <podname>`"
        summary: |-
          This is a multi-line summary with
          linebreaks and everything. Here you can give a more detailed
          summary of what this alert is about
      labels:
        namespace: <team namespace> # required
        severity: critical
```

Apply this resource to your teams namespace by creating a file containing the content above with your own values and running `kubectl apply -f <path to file>`

This file should be added to your application repository, alongside `nais.yaml` and be deployed by your CI/CD pipeline using the nais deploy action.

You can see the alerts in the Alertmanager at `https://alertmanager.<environment>.nav.cloud.nais.io/` and the defined rules in Prometheus at `https://prometheus.<environment>.nav.cloud.nais.io/rules`

### Send resolved

A message will be automatically sent when the alert is resolved. In some cases this message may be unnecessary and can be disabled by adding the label `send_resolved: "false"`:

```yaml
      ...
      labels:
        namespace: <team namespace> # required
        severity: info
        send_resolved: "false"
```

### Deployment

To automatically deploy your alerts to the cluster, you can use the nais deploy action. This action will deploy the alerts to the cluster when you change the `alerts.yaml` file in your repository.

```yaml
name: Deploy alerts to NAIS
on:
  push:
    branches:
      - main
    paths:
      - 'alerts.yaml'
      - '.github/workflows/alerts.yaml'
jobs:
  apply-alerts:
    name: Apply alerts to cluster
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v2
      - name: deploy to dev-gcp
        uses: nais/deploy/actions/deploy@v1
        env:
          APIKEY: ${{ secrets.NAIS_DEPLOY_APIKEY }}
          CLUSTER: dev-gcp
          RESOURCE: /path/to/alerts.yaml
      - name: deploy to prod-gcp
        uses: nais/deploy/actions/deploy@v1
        env:
          APIKEY: ${{ secrets.NAIS_DEPLOY_APIKEY }}
          CLUSTER: prod-gcp
          RESOURCE: /path/to/alerts.yaml
```

## How to write a good alert

### Writing the `expr`

In order to figure out what is a valid expression we suggest using [Grafana > Explore](https://grafana.nais.io/explore). It has a graphical user interface with a "builder" mode where you can select from from drop-down lists of valid values.

In order to further minimize the feedback loop we suggest experimenting on the Prometheus server to find the right metric for your alert and the notification threshold.
The Prometheus server can be found in each cluster, at `https://prometheus.{env}.nav.cloud.nais.io` (e.g. [https://prometheus.dev-gcp.nav.cloud.nais.io](https://prometheus.dev-gcp.nav.cloud.nais.io)).

You can also visit the Alertmanager at `https://alertmanager.{env}.nav.cloud.nais.io` (e.g. [https://alertmanager.dev-gcp.nav.cloud.nais.io](https://alertmanager.dev-gcp.nav.cloud.nais.io)) to see which alerts are triggered now (you can also silence already triggered alerts).

### `for`

How long time the `expr` must evaluate to `true` before firing.

When the `expr` first evaluates to `true` the alert will be in `pending` state for the duration specified.

Example values: `30s`, `5m`, `1h`.

### Severity

This will affect what color the notification gets. Possible values are `critical` (red), `warning` (yellow) and `notice` (green).

### Consequence

Optionally describe ahead of time to the one receiving the alert what happens in the world when this alert fires.

### Action

Optionally describe ahead of time to the one receiving the alert what is the best course of action to resolve this issue.

### Summary

Optional longer description of the alert

## Customizing

Each team namespace will have a default `AlertmanagerConfig` which will pickup alerts labeled `namespace: <team namespace>`. If you want to change anything about alerting for your team, e.g. the formatting of alerts, webhook used, ..., you can create a simular `AlertmanagerConfig` which is configured for different labels:

```
route:
  matchers:
    - name: team
      value: myteam
      matchType: =
    - name: app
      value: myapp
      matchType: =
```

Remember that these matchers will match against every alert in the cluster, so be sure to use values that will be unique for your team.  
In your `PrometheusRule` also include the label `alert_type: custom` to be sure the default configuration doesn't pickup your alert.

For more information about `slackConfigs` and other posibilites see the [Prometheus alerting documentation](https://prometheus.io/docs/alerting/latest/configuration/#slack_config).


### Recording rules

Recording rules allow you to precompute frequently needed or computationally expensive expressions and save
their result as a new set of time series. Querying the precomputed result will then often be much faster
than executing the original expression every time it is needed.

Example:
```yaml
---
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: my-alert
  namespace: my-namespace
spec:
  groups:
    - name: example-with-record-alerts
      rules:
        - record: is_european_summer_time
          expr: |
            (vector(1) and (month() > 3 and month() < 10))
            or
            (vector(1) and (month() == 3 and (day_of_month() - day_of_week()) >= 25) and absent((day_of_month() >= 25) and (day_of_week() == 0)))
            or
            (vector(1) and (month() == 10 and (day_of_month() - day_of_week()) < 25) and absent((day_of_month() >= 25) and (day_of_week() == 0)))
            or
            (vector(1) and ((month() == 10 and hour() < 1) or (month() == 3 and hour() > 0)) and ((day_of_month() >= 25) and (day_of_week() == 0)))
            or
            vector(0)
        - record: european_time
          expr: time() + 3600 * (is_european_summer_time + 1)
        - record: european_hour
          expr: hour(european_time)
        - alert: QuietHours
          expr: european_hour >= 23 or european_hour <= 6
          for: 5m
          labels:
            namespace: my-namespace
            severity: critical
          annotations:
            description: 'This alert fires during quiet hours. It should be blackholed by Alertmanager.'
```

### Onprem

For Custom AlertmanagerConfig in the onprem clusters, calling external webhooks like Slack will require you to configure the webhook to use proxy:

```
httpConfig:
  proxyURL: http://webproxy.nais:8088
```


### Custom AlertmanagerConfig

You can use an `AlertmanagerConfig` if you need to change the default slack layout, 
need another channel than the default channel, need another set of colors etc.
Here is a basic example with a single alert (that always trigger to make this easy to use in testing).

```yaml

apiVersion: "monitoring.coreos.com/v1"
kind: PrometheusRule
metadata:
  labels:
    team: myteam
  name: myteam-testing-alerts
  namespace: myteam
  # test alerts, will always trigger
  # used only to experiment with formatting etc
spec:
  groups:
    - name: myteam-testing-alerts
      rules:
        - alert: test alert will always trigger
          expr: container_memory_working_set_bytes{namespace="myteam", container="myteam-myapp"} > 99
          for: 1m
          annotations:
            consequence: "_*{{ $labels.container }}*_ has a working set of {{ $value }} bytes, there is no consequence"
            action: "no need to do _anything_"
            documentation: "https://prometheus.io/docs/prometheus/latest/querying/basics/"
            summary: "Container _*{{ $labels.container }}*_ has a working set of {{ $value }} bytes."
            sla: "no need to respond"
          labels:
            severity: "info"
            special_type_to_use_in_alertmanager_config: myteam-testing
            alert_type: custom


---

apiVersion: monitoring.coreos.com/v1alpha1
kind: AlertmanagerConfig
metadata:
  name: myteam-testing-slack
  namespace: myteam
  labels:
    alertmanagerConfig: myteam-testing-slack
spec:
  receivers:
    - name: myteam-testing-receiver
      slackConfigs:
        - apiURL:
            key: apiUrl
            name: slack-webhook
          channel: 'myteam-special-channel'
          iconEmoji: ':test:'
          username: 'Testing Alert'
          sendResolved: true
          httpConfig:
            proxyURL: http://webproxy.nais:8088
          title: |-
            [{{ .Status | toUpper }}{{ if eq .Status "firing" }}:{{ .Alerts.Firing | len }}{{ end }}] {{ .CommonLabels.alertname }}
          text: >-
            {{ range .Alerts -}}
            *Alert:* {{ .Annotations.title }}{{ if .Labels.severity }} - `{{ .Labels.severity }}`{{ end }}
            *Description:* {{ .Annotations.description }}
            *Details:*
            {{ range .Labels.SortedPairs }} • *{{ .Name }}:* `{{ .Value }}`
            {{ end }}
            {{ end }}
          color: |-
            {{ if eq .Status "firing" -}}
              {{ if eq .CommonLabels.severity "warning" -}}
                warning
              {{- else if eq .CommonLabels.severity "fatal" -}}
                #611f69
              {{- else if eq .CommonLabels.severity "critical" -}}
                #611f69
              {{- else if eq .CommonLabels.severity "danger" -}}
                danger
              {{- else if eq .CommonLabels.severity "error" -}}
                danger
              {{- else if eq .CommonLabels.severity "notice" -}}
                good
              {{- else if eq .CommonLabels.severity "info" -}}
                #36c5f0
              {{- else -}}
                .CommonLabels.severity
              {{- end -}}
            {{ else -}}
            good
            {{- end }}
  route:
    groupBy:
      - alertname
    matchers:
      - name: "special_type_to_use_in_alertmanager_config"
        matchType: "="
        value: "myteam-testing"
    groupInterval: 10s
    groupWait: 5s
    receiver: myteam-testing-receiver
    repeatInterval: 2m


```

The label `special_type_to_use_in_alertmanager_config` is used to pair the alerts with the corresponding route.
To prevent the default nais `AlertmanagerConfig` route to include the alerts you need to 
set the label `alert_type` to `custom`. If you don't set the label `alert_type` to `custom` you will get 2 
slack messages for each alert, one from your custom `AlertmanagerConfig` and one from the nais default `AlertmanagerConfig`.  

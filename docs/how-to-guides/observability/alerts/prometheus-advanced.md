---
description: Advanced guide to customized Promethues alerts
tags: [guide]
---
# Customize Prometheus alerts

This guide will show you how to customize Promethues alerts for your team. This is useful if you want to experiment with formatting, use a different webhook, or have a different set of labels for your alerts.

## 0. Prerequisites

Each team namespace will have a default `AlertmanagerConfig` which will pickup alerts labeled `namespace: <MY-TEAM>`. If you want to change anything about alerting for your team, e.g. the formatting of alerts, webhook used, ..., you can create a simular `AlertmanagerConfig` which is configured for different labels

## 1. Create PrometheusRule

Remember that these matchers will match against every alert in the cluster, so be sure to use values that will be unique for your team.
In your `PrometheusRule` also include the label `alert_type: custom` to be sure the default configuration doesn't pickup your alert.

For more information about `slackConfigs` and other posibilites see the [Prometheus alerting documentation](https://prometheus.io/docs/alerting/latest/configuration/#slack_config).

???+ note ".nais/prometheusrule.yaml"
    ```yaml hl_lines="5-7 12 25-26"
    apiVersion: "monitoring.coreos.com/v1"
    kind: PrometheusRule
    metadata:
      labels:
        team: <MY-TEAM>
      name: <MYTEAM-TESTING-ALERTS>
      namespace: <MY-TEAM>
      # test alerts, will always trigger
      # used only to experiment with formatting etc
    spec:
      groups:
        - name: <MYTEAM-TESTING-ALERTS>
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
    ```

## 3. Create AlertmanagerConfig

You can use an `AlertmanagerConfig` if you need to change the default slack layout,
need another channel than the default channel, need another set of colors etc.
Here is a basic example with a single alert (that always trigger to make this easy to use in testing).

???+ note ".nais/alertconfig.yaml"
    ```yaml hl_lines="4-7 10 15 57 59 62"
    apiVersion: monitoring.coreos.com/v1alpha1
    kind: AlertmanagerConfig
    metadata:
      name: <MYTEAM-TESTING-SLACK>
      namespace: <MY-TEAM>
      labels:
        alertmanagerConfig: <MYTEAM-TESTING-SLACK>
    spec:
      receivers:
        - name: <MYTEAM-TESTING-RECEIVER>
          slackConfigs:
            - apiURL:
                key: apiUrl
                name: slack-webhook
              channel: "<MYTEAM-SPECIAL-CHANNEL>"
              iconEmoji: ":test:"
              username: "Testing Alert"
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
            value: "<MYTEAM-TESTING>"
        groupInterval: 10s
        groupWait: 5s
        receiver: <MYTEAM-TESTING-RECEIVER>
        repeatInterval: 2m
    ```

The label `special_type_to_use_in_alertmanager_config` is used to pair the alerts with the corresponding route.
To prevent the default nais `AlertmanagerConfig` route to include the alerts you need to
set the label `alert_type` to `custom`. If you don't set the label `alert_type` to `custom` you will get 2
slack messages for each alert, one from your custom `AlertmanagerConfig` and one from the nais default `AlertmanagerConfig`.

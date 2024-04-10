---
description: Create alerts for your application using Prometheus.
tags: [how-to, observability, alerting, prometheus]
---

# Create alert with Prometheus

This guide shows you how to create alerts for your application.

## Prerequisites

- Your application serves [metrics](../../metrics/how-to/expose.md)

You can define alerts by using Kubernetes resources (`PrometheusRule`), as well as directly in Grafana (GUI based).

You will have a separate alertmanager for each environment available at `https://alertmanager.<MY-ENV>.<<tenant()>>.cloud.nais.io/`

## Create PrometheusRule

We use native [Prometheus alert rules](https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/), and let [Alertmanager](https://prometheus.io/docs/alerting/latest/alertmanager/) handle the notifications.

You can define alerts by creating a `PrometheusRule` resource in your teams namespace.

???+ note ".nais/alert.yaml"

    ```yaml hl_lines="4-5 7 10 23"
    apiVersion: monitoring.coreos.com/v1
    kind: PrometheusRule
    metadata:
      name: <MY-ALERT>
      namespace: <MY-TEAM>
      labels:
        team: <MY-TEAM>
    spec:
      groups:
      - name: <MY-ALERT>
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
            namespace: <MY-TEAM> # required
            severity: critical
    ```

## Activate the alert
=== "Automatically"
    Add the file to your application repository, alongside `nais.yaml` to deploy with [NAIS github action](../../../build/how-to/build-and-deploy.md).
    Some [link](
=== "Manually" 
    ```bash
    kubectl apply -f ./nais/alert.yaml
    ```

## Verify your alert
You can see the alerts in the Alertmanager at `https://alertmanager.<MY-ENV>.<<tenant()>>.cloud.nais.io/` and the defined rules in Prometheus at `https://prometheus.<MY-ENV>.<<tenant()>>.cloud.nais.io/rules`

## Disable resolved (Optional)

A message will be automatically sent when the alert is resolved. In some cases this message may be unnecessary and can be disabled by adding the label `send_resolved: "false"`:

```yaml
labels:
  namespace: <MY-TEAM> # required
  severity: info
  send_resolved: "false"
```

Learn how to write good alerts [here](../README.md)

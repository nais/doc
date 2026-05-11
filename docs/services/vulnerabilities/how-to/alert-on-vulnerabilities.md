---
description: Alert on Slack or Grafana when critical vulnerabilities are detected in your workloads.
tags: [how-to, vulnerabilities, alerting, prometheus]
---

# Alert on vulnerabilities

This guide shows you how to set up alerts when new critical vulnerabilities are detected in your workloads.

Nais exposes Prometheus metrics for vulnerability status and risk per workload. You can use these to alert your team via Slack or Grafana.

## Prerequisites

- Your workload has an SBOM generated via [nais/docker-build-push](sbom.md)
- You are familiar with [basic Prometheus alerting](../../../observability/alerting/how-to/prometheus-basic.md)

## Alert on critical vulnerabilities

Create a `PrometheusRule` in your namespace that triggers an alert when the number of critical vulnerabilities exceeds zero.

???+ note ".nais/alert-vulnerabilities.yaml"

    ```yaml
    apiVersion: monitoring.coreos.com/v1
    kind: PrometheusRule
    metadata:
      name: vulnerability-alerts
      namespace: <MY-TEAM>
      labels:
        team: <MY-TEAM>
    spec:
      groups:
        - name: vulnerability-alerts
          rules:
            - alert: CriticalVulnerability
              expr: nais_workload_vulnerabilities{severity="CRITICAL", workload_namespace="<MY-TEAM>"} > 0
              for: 10m
              annotations:
                summary: "Critical vulnerability detected in {{ $labels.workload_name }}"
                consequence: "The workload is running with one or more critical vulnerabilities."
                action: "Go to Nais Console and handle the vulnerability for {{ $labels.workload_name }}."
              labels:
                namespace: <MY-TEAM>
                severity: critical
    ```

## Alert on high risk score

You can also alert based on `nais_workload_risk_score` if you prefer a single aggregated alert per workload instead of one per severity level.

The risk score is calculated as:

```
(CRITICAL × 10) + (HIGH × 5) + (MEDIUM × 3) + (LOW × 1) + (UNASSIGNED × 5)
```

A workload with 1 critical vulnerability scores 10, while 20 critical vulnerabilities scores 200. Choose a threshold that matches your team's risk tolerance — `200` is a reasonable starting point and corresponds roughly to 20 critical or 40 high severity vulnerabilities.

```yaml
- alert: HighRiskScore
  expr: nais_workload_risk_score{workload_namespace="<MY-TEAM>"} > 200
  for: 10m
  annotations:
    summary: "High risk score for {{ $labels.workload_name }}"
    consequence: "The workload has accumulated a high vulnerability score."
    action: "Go to Nais Console and handle vulnerabilities for {{ $labels.workload_name }}."
  labels:
    namespace: <MY-TEAM>
    severity: warning
```

## Activate the alert

=== "Automatically"
    Add the file to your application repository and deploy with [Nais GitHub Action](../../../build/how-to/build-and-deploy.md).

=== "Manually"
    ```bash
    kubectl apply -f .nais/alert-vulnerabilities.yaml
    ```

## Alert to a dedicated Slack channel

By default, alerts are sent to your team's standard Slack channel. If you want to send vulnerability alerts to a dedicated channel, create an `AlertmanagerConfig`.

See [Advanced Prometheus alerting](../../../observability/alerting/how-to/prometheus-advanced.md) for a complete example with a custom Slack channel and webhook.

## Alert in Grafana

Alternatively, you can create alerts directly in Grafana without deploying Kubernetes resources:

1. Open Grafana and go to **Alerting → Alert rules**
2. Click **New alert rule**
3. Select the Prometheus/Mimir data source that contains `nais_workload_*` metrics and use e.g.:
   ```promql
   nais_workload_vulnerabilities{severity="CRITICAL", workload_namespace="<MY-TEAM>"}
   ```
4. Set the threshold and connect to a Slack contact point

See [Create alert in Grafana](../../../observability/alerting/how-to/grafana.md) for a complete step-by-step guide.

???+ note "Metric update delay after suppression"
    After suppressing a vulnerability, the database is updated immediately, but Prometheus metrics (`nais_workload_vulnerabilities`, `nais_workload_risk_score`) are refreshed on a periodic interval (default: 5 minutes). An active alert may therefore remain firing for up to 5 minutes after suppression.

## Learn more

- [Basic Prometheus alerting](../../../observability/alerting/how-to/prometheus-basic.md)
- [Advanced Prometheus alerting](../../../observability/alerting/how-to/prometheus-advanced.md)
- [Create alert in Grafana](../../../observability/alerting/how-to/grafana.md)

---
description: Set up Prometheus or Grafana alerts for vulnerability findings in your workloads, including critical severity, priority-based findings, and high risk scores.
tags: [how-to, vulnerabilities, alerting, prometheus, grafana]
---

# Alert on vulnerabilities

This guide shows you how to set up alerts when critical, priority-based, or high-risk vulnerability findings are present in your workloads.

Nais exposes Prometheus metrics for vulnerability counts, priority, and risk per workload. You can use these to alert your team via Slack or Grafana.

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

## Alert on priority (ACT_NOW and HIGH)

Nais also exposes a priority-based metric for the two highest-priority classes: `nais_workload_vulnerabilities_priority`.

Use this when you want exploitability-driven urgency, not only CVSS severity.

- `ACT_NOW`: `has_kev_entry=true`, based on [CISA KEV](https://www.cisa.gov/known-exploited-vulnerabilities-catalog).
  This means known exploitation in the wild and should be treated as highest remediation priority.
- `HIGH`: `has_kev_entry=false` and (`known_ransomware_use=true` or [EPSS](https://www.first.org/epss/) percentile `>= 0.90`).
  This means elevated likelihood of exploitation and should be handled quickly.

A CVE is counted in only one of these classes. If it has a KEV entry, it is counted as `ACT_NOW`, not `HIGH`.

???+ note ".nais/alert-priority-vulnerabilities.yaml"

    ```yaml
    apiVersion: monitoring.coreos.com/v1
    kind: PrometheusRule
    metadata:
      name: priority-vulnerability-alerts
      namespace: <MY-TEAM>
      labels:
        team: <MY-TEAM>
    spec:
      groups:
        - name: priority-vulnerability-alerts
          rules:
            - alert: ActNowVulnerability
              expr: nais_workload_vulnerabilities_priority{priority="ACT_NOW", workload_namespace="<MY-TEAM>"} > 0
              for: 10m
              annotations:
                summary: "ACT_NOW vulnerability detected in {{ $labels.workload_name }}"
                consequence: "The workload has one or more ACT_NOW vulnerabilities."
                action: "Open Nais Console and handle the vulnerability for {{ $labels.workload_name }}."
              labels:
                namespace: <MY-TEAM>
                severity: critical
            - alert: HighPriorityVulnerability
              expr: nais_workload_vulnerabilities_priority{priority="HIGH", workload_namespace="<MY-TEAM>"} > 0
              for: 10m
              annotations:
                summary: "High-priority vulnerability detected in {{ $labels.workload_name }}"
                consequence: "The workload has one or more HIGH priority vulnerabilities."
                action: "Open Nais Console and handle the vulnerability for {{ $labels.workload_name }}."
              labels:
                namespace: <MY-TEAM>
                severity: warning
    ```

## Alert on high risk score

You can also alert based on `nais_workload_risk_score` if you prefer a single aggregated alert per workload instead of one per severity level.

The risk score is calculated as:

```
(CRITICAL × 10) + (HIGH × 5) + (MEDIUM × 3) + (LOW × 1) + (UNASSIGNED × 5)
```

A workload with 1 critical vulnerability scores 10, while 20 critical vulnerabilities score 200. Choose a threshold that matches your team's risk tolerance — `200` is a reasonable starting point and corresponds roughly to 20 critical or 40 high severity vulnerabilities.

???+ note ".nais/alert-risk-score.yaml"

    ```yaml
    apiVersion: monitoring.coreos.com/v1
    kind: PrometheusRule
    metadata:
      name: risk-score-alerts
      namespace: <MY-TEAM>
      labels:
        team: <MY-TEAM>
    spec:
      groups:
        - name: risk-score-alerts
          rules:
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

## Activate alerts

=== "Automatically"
    Add the rule file to your application repository and deploy it with [Nais GitHub Action](../../../build/how-to/build-and-deploy.md).

=== "Manually"
    Apply the rule file you created, for example:

    ```bash
    kubectl apply -f .nais/alert-priority-vulnerabilities.yaml
    ```

## Send alerts to a dedicated Slack channel

By default, alerts are sent to your team's standard Slack channel. If you want to send vulnerability alerts to a dedicated channel, create an `AlertmanagerConfig`.

See [Advanced Prometheus alerting](../../../observability/alerting/how-to/prometheus-advanced.md) for a complete example with a custom Slack channel and webhook.

## Create alerts in Grafana

Alternatively, you can create alerts directly in Grafana without deploying Kubernetes resources:

1. Open Grafana and go to **Alerting → Alert rules**
2. Click **New alert rule**
3. Select the Prometheus/Mimir data source that contains `nais_workload_*` metrics and use e.g.:
   ```promql
   nais_workload_vulnerabilities_priority{priority="ACT_NOW", workload_namespace="<MY-TEAM>"}
   ```
4. Set the threshold and connect to a Slack contact point

See [Create alert in Grafana](../../../observability/alerting/how-to/grafana.md) for a complete step-by-step guide.

??? note "Metric update delay after suppression"
    After suppressing a vulnerability, the database is updated immediately. Workload metrics (`nais_workload_vulnerabilities`, `nais_workload_vulnerabilities_priority`, `nais_workload_risk_score`) are recomputed periodically (default: every 5 minutes), and alerts clear only after updated metrics are pushed and scraped by Prometheus. Expect roughly a 5-minute delay, plus normal metrics propagation time.

## Learn more

- [Basic Prometheus alerting](../../../observability/alerting/how-to/prometheus-basic.md)
- [Advanced Prometheus alerting](../../../observability/alerting/how-to/prometheus-advanced.md)
- [Create alert in Grafana](../../../observability/alerting/how-to/grafana.md)

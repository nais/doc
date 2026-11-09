---
description: Set up Prometheus or Grafana alerts for vulnerability findings in your workloads, including critical severity, known exploitation, high priority, and high risk scores.
tags: [how-to, vulnerabilities, alerting, prometheus, grafana]
---

# Alert on vulnerabilities

Use Nais workload metrics to alert your team when vulnerabilities exceed your chosen thresholds. Suppressed vulnerabilities are excluded.

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

## Alert on known exploitation and high priority

Use `nais_workload_vulnerabilities_kev` to alert on vulnerabilities with known exploitation, or `nais_workload_vulnerabilities_priority{priority="HIGH"}` for the broader high-priority group.

The priority metric emits `HIGH`, `ELEVATED`, and `MONITOR`.

- The KEV metric counts findings with `has_kev_entry=true`, based on the [CISA KEV catalog :octicons-link-external-16:](https://www.cisa.gov/known-exploited-vulnerabilities-catalog).
- `HIGH` counts findings with a KEV entry, known ransomware use, [EPSS :octicons-link-external-16:](https://www.first.org/epss/) percentile `>= 0.95`, or EPSS score `>= 0.10`.
- To alert on `ELEVATED` instead, change the priority selector. This tier covers critical or high severity findings with EPSS percentile `>= 0.90` that do not qualify for `HIGH`. Remaining findings are `MONITOR`.

A finding belongs to only one priority tier. KEV findings also count as `HIGH`, so deploying both rules below can produce two alerts for the same workload. Choose the rule that matches your team's needs.

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
            - alert: KnownExploitedVulnerability
              expr: nais_workload_vulnerabilities_kev{workload_namespace="<MY-TEAM>"} > 0
              for: 10m
              annotations:
                summary: "Known exploited vulnerability detected in {{ $labels.workload_name }}"
                consequence: "The workload has one or more vulnerabilities with known exploitation."
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

```text
(CRITICAL × 10) + (HIGH × 5) + (MEDIUM × 3) + (LOW × 1) + (UNASSIGNED × 5)
```

Here, `HIGH` means CVSS severity, not the `HIGH` priority tier. The score does not include KEV or EPSS.

A workload with 1 critical vulnerability scores 10, while 20 critical vulnerabilities score 200. Choose a threshold that matches your team's risk tolerance. The example below triggers only when the score exceeds `200`, not when it equals `200`.

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
   nais_workload_vulnerabilities_priority{priority="HIGH", workload_namespace="<MY-TEAM>"}
   ```
4. Set the threshold and connect to a Slack contact point

See [Create alert in Grafana](../../../observability/alerting/how-to/grafana.md) for a complete step-by-step guide.

??? note "Metric update delay after suppression"
    After suppressing a vulnerability, the database is updated immediately. Workload metrics (`nais_workload_vulnerabilities`, `nais_workload_vulnerabilities_kev`, `nais_workload_vulnerabilities_priority`, `nais_workload_risk_score`) are recomputed periodically (default: every 5 minutes), and alerts clear only after Prometheus collects the updated metrics. Expect up to 5 minutes before the next refresh, plus normal metrics propagation time.

## Learn more

- [Basic Prometheus alerting](../../../observability/alerting/how-to/prometheus-basic.md)
- [Advanced Prometheus alerting](../../../observability/alerting/how-to/prometheus-advanced.md)
- [Create alert in Grafana](../../../observability/alerting/how-to/grafana.md)

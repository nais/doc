---
title: Create alerts from templates
description: >-
  Turn a Nais APM issue or service into a Grafana alert rule using the built-in
  custom, CrashLoopBackOff, exception-spike, web-vitals, and new frontend
  exception templates.
tags: [how-to, observability, apm, alerting]
---

# Create alerts from templates

Nais APM can pre-fill a Grafana alert rule for you, scoped to the service (and,
where it makes sense, the exact issue) you're looking at. Review the generated
rule before saving it. Notifications use your team's Slack alert channel for
the selected environment, configured in [Nais Console](../../../operate/console/README.md).

## Prerequisites

Configure a Slack alert channel for the target environment in Nais Console.
Nais automatically creates your team's Grafana folder, contact points, and
notification policies. Environments without a configured Slack alert channel
do not send notifications through this setup.

## Create an alert

1. Select your team and exactly one environment in Nais APM.
2. From a service page or an issue drawer, use **Create alert**. Grafana's
   new-rule form opens with the query, thresholds, routing labels, severity,
   and a back-link annotation filled in. For **Custom alert**, add your own
   name, query, and alert condition.
3. Review the rule and its folder. The template preselects the existing team
   folder when exactly one folder title matches your team name. If no folder
   is preselected, select your team's folder in Grafana.
4. Leave direct contact-point selection unset so Grafana uses notification
   policies. Keep the generated `team` and `env` labels.
5. Use **Preview routing** to check that the rule routes to the contact point
   for your team's intended environment, then save.

The annotation on issue-related alerts deep-links straight back to the issue in
Nais APM, so a notification takes you to the exact error.

For routing-label details, see [Configure notifications](../../alerting/how-to/grafana.md#configure-notifications).

## Check existing rules

Template updates do not change existing alert rules. Open each existing rule
and check its `team` and `env` labels. Remove any direct contact-point selection
if you want to use the automatic notification policies, then use **Preview
routing** to verify the destination before saving.

## The templates

| Template | Alerts when | Scope | Default severity |
| -------- | ----------- | ----- | ---------------- |
| **Custom alert** | The condition you define is met | Your query determines the scope | `warning` |
| **CrashLoopBackOff** | A container stays in CrashLoopBackOff for 5 minutes | All pods in the selected team namespace and environment, not just this service | `warning` |
| **Exception spike** | Occurrences of a specific issue exceed a threshold in a 5-minute window | A single issue | `warning` |
| **New frontend exceptions** | A frontend exception appears in the last 30 minutes but not in the preceding 7 days | Service (frontend) | `info` |
| **Web Vitals (LCP)** | LCP p75 exceeds 2.5 seconds | Service (frontend) | `info` |

Change the `severity` label to `info`, `warning`, or `critical` in Grafana's
rule editor to match your team's needs before saving.

- **Custom alert** pre-fills routing labels and your team folder when available.
  Add your own name, query, and alert condition.
- **CrashLoopBackOff** watches all pods in the selected team namespace and
  environment, not just the service.
- **Exception spike** is per-issue — open it from an issue drawer to alert on
  that fingerprint specifically. Its card in **Alerts** links to **Issues**.
- **New frontend exceptions** uses the Faro recording rule in Mimir to detect
  exceptions not seen in the preceding 7 days. Requires frontend telemetry.
- **Web Vitals (LCP)** watches the browser-side performance signals, not errors.

## Where the deep links point

Issue-related alerts (**exception spike**, **new frontend exceptions**) annotate back to
the **Issues** tab. The **web-vitals** alert points at the **Frontend** tab —
it's a UX-health alert, not an issue. These links are a
[stable contract](../reference/url-contract.md): they keep resolving across
releases, so alerts you created months ago still open the right place.

## Related

- [Triage an issue](triage-an-issue.md)
- [Alerting on Nais](../../alerting/README.md) — how alert delivery to Slack
  works on the platform.

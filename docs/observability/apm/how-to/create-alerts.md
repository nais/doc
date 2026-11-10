---
title: Create alerts from templates
description: >-
  Turn a Nais APM issue or service into a Grafana alert rule using the built-in
  error-rate, SLO burn-rate, exception-spike, web-vitals, and new-exception
  templates.
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
   and a back-link annotation filled in.
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
| **Error rate** | The service's error ratio crosses ~5% of requests | Service | `warning` |
| **SLO burn rate** | The error budget for a target SLO burns too fast — fast burn (14.4× over 1h) pages, slow burn (6× over 6h) tickets | Service | `critical` (fast), `warning` (slow) |
| **Exception spike** | Occurrences of a specific issue exceed a threshold in a 5-minute window | A single issue | `warning` |
| **New exceptions** | A new exception pattern appears that wasn't there before | Service | `info` |
| **Web vitals** | Core Web Vitals degrade (frontend UX health) | Service (frontend) | `info` |

Change the `severity` label to `info`, `warning`, or `critical` in Grafana's
rule editor to match your team's needs before saving.

- **Error rate** builds a Mimir rule from the service's RED metrics.
- **SLO burn rate** builds a Google-SRE multi-window multi-burn-rate rule on the
  service's RED error ratio. Pick **fast burn** (a paging signal — the budget
  burns 14.4× over 1h) or **slow burn** (a non-paging ticket — 6× over 6h) from
  the service page; both are derived from a target SLO you set.
- **Exception spike** is per-issue — open it from an issue drawer to alert on
  that fingerprint specifically.
- **New exceptions** is a LogQL approximation of "an error we've never seen
  before just showed up." It ships with an honest in-product explainer of what
  it can and can't catch.
- **Web vitals** watches the browser-side performance signals, not errors.

## Where the deep links point

Issue-related alerts (**exception spike**, **new exceptions**) annotate back to
the **Issues** tab. The **web-vitals** alert points at the **Frontend** tab —
it's a UX-health alert, not an issue. These links are a
[stable contract](../reference/url-contract.md): they keep resolving across
releases, so alerts you created months ago still open the right place.

## Related

- [Triage an issue](triage-an-issue.md)
- [Alerting on Nais](../../alerting/README.md) — how alert delivery to Slack
  works on the platform.

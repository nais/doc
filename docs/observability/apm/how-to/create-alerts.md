---
title: Create alerts from templates
description: >-
  Turn a Nais APM issue or service into a Grafana alert rule using the built-in
  error-rate, exception-spike, web-vitals, and new-exception templates.
tags: [how-to, observability, apm, alerting]
---

# Create alerts from templates

!!! warning "Under construction"
    The **Alerts** tab is still being built out. Creating alert rules from the
    templates below works today. Organizing those rules into proper per-team
    folders — and the storage story behind them — is an ongoing platform effort
    and not finished yet, so don't rely on where a rule lands for now.

Nais APM can pre-fill a Grafana alert rule for you, scoped to the service (and,
where it makes sense, the exact issue) you're looking at. You review the
generated rule and choose where it notifies — Nais APM builds the query, you
own the delivery.

## Create an alert

From a service page or an issue drawer, use the **Create alert** action. It
opens Grafana's new-rule form with the query, thresholds, and a back-link
annotation already filled in. Adjust anything you like, then set the contact
point and save.


The annotation on issue-related alerts deep-links straight back to the issue in
Nais APM, so a notification takes you to the exact error.

## The templates

| Template | Alerts when | Scope |
| -------- | ----------- | ----- |
| **Error rate** | The service's error ratio crosses ~5% of requests | Service |
| **Exception spike** | Occurrences of a specific issue exceed a threshold in a 5-minute window | A single issue |
| **New exceptions** | A new exception pattern appears that wasn't there before | Service |
| **Web vitals** | Core Web Vitals degrade (frontend UX health) | Service (frontend) |

- **Error rate** builds a Mimir rule from the service's RED metrics.
- **Exception spike** is per-issue — open it from an issue drawer to alert on
  that fingerprint specifically.
- **New exceptions** is a LogQL approximation of "an error we've never seen
  before just showed up." It ships with an honest in-product explainer of what
  it can and can't catch.
- **Web vitals** watches the browser-side performance signals, not errors.

!!! note "No burn-rate template yet"
    SLO / error-budget burn-rate alerting is on the roadmap but not shipped.
    Only the four templates above exist today.

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

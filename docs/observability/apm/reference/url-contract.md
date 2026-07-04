---
description: >-
  The stable URL and query-parameter contract for deep-linking into Nais APM
  from alerts, runbooks, and shared investigations.
tags: [reference, observability, apm]
---

# URL and deep-link contract

Nais APM's page URLs and query parameters are a **stable contract**. Alert
annotations, Slack notifications, runbooks, and links you share all depend on
them, so they keep resolving across releases. You can safely hand-build these
links or paste them into a runbook.

All paths below are rooted at the app:
`<<tenant_url("grafana", "a/nais-apm-app")>>`.

## Page URLs

| Path | Page |
| ---- | ---- |
| `/a/nais-apm-app/services` | Service inventory |
| `/a/nais-apm-app/services/{namespace}/{service}` | Service detail |
| `/a/nais-apm-app/namespaces/{namespace}` | Namespace overview |
| `/a/nais-apm-app/dependencies/{name}` | Dependency detail |

## Shared query parameters

| Param | Values | Meaning |
| ----- | ------ | ------- |
| `tab` | `overview` \| `issues` \| `alerts` \| `backend` \| `frontend` \| `database` \| `dependencies` \| `traces` \| `logs` \| `profiling` | Active tab on the service detail page. The legacy values `server` and `runtime` both still resolve — they now open **Backend**, which merged the old Endpoints and Runtime tabs. |
| `environment` | cluster name, e.g. `prod-gcp` | Environment filter (matches the `k8s_cluster_name` label). |
| `from`, `to` | Grafana time expressions (`now-1h`, unix ms) | The shared time range applied across every tab. |

## Opening the issue drawer

The issue drawer opens purely from URL state — this is the deep-link target for
alert notifications and shared investigations. It resolves identically on both
`tab=issues` and `tab=frontend`, so a link built for one tab still opens the
drawer on the other.

```
/a/nais-apm-app/services/{namespace}/{service}?tab=issues&environment={env}&issueId={fingerprint}
/a/nais-apm-app/services/{namespace}/{service}?tab=frontend&environment={env}&exceptionHash={hash}
```

| Param | Meaning |
| ----- | ------- |
| `issueId` | Fingerprint-based issue identity, e.g. `v1:9f2ab31c04d7e655`. The primary drawer key — see [Issues and fingerprinting](issues-model.md). |
| `exceptionHash` | Legacy identity: a single raw collector hash. Still resolves (opens the drawer scoped to that one hash) — kept working **forever**, because old alert annotations and shared links use it. |
| `exceptionSessionId` | Selects a session inside the drawer (optional). Only meaningful together with `issueId` or `exceptionHash`. |

## Stability guarantees

- `tab=frontend&issueId=…` and legacy `exceptionHash` links keep resolving
  forever — they predate the Issues tab and ship in alert annotations.
- Alert-template deep links point issue-related alerts (exception-spike,
  new-exceptions) at `tab=issues`; the web-vitals alert points at `tab=frontend`.
- Renames are treated as breaking changes: an old parameter keeps resolving as
  an alias for at least two minor releases, and the change is noted in the
  CHANGELOG.

## Related

- [Create alerts from templates](../how-to/create-alerts.md) — where the
  deep-link annotations come from.
- [Issues and fingerprinting](issues-model.md)

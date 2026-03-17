---
tags: [how-to, opensearch, dashboard]
---

# Get access to the dashboard

Each OpenSearch instance in Aiven comes with a built-in dashboard for visualizing your data.
To get access to this dashboard you need to follow these steps:

{%- if tenant() == "nav" %}
## Prerequisites

For production services, you need to have the `aiven-prod` gateway enabled in Naisdevice. 
This is done through [Just In Time Access (JITA)](../../../operate/naisdevice/explanations/jita.md).

{%- endif %}

## Steps

### 1. Get temporary credentials

Get temporary credentials for the OpenSearch instance using [nais-cli](../../../operate/cli/README.md):

```shell
nais opensearch credentials <instance> \
    --team <team> \
    --environment <environment> \
    --permission <access-level> \
    --ttl <duration>
```

where

- `<instance>` is the name of the OpenSearch instance you want to access. A list of your team's instances can be found in [Nais Console](<<tenant_url("console")>>).
- `<team>` is the name of the team that owns the OpenSearch instance.
- `<environment>` is the environment where the instance runs (e.g. `dev`, `prod`).
- `<access-level>` is one of the available [access levels](../reference/README.md#access-levels), such as `read`.
- `<duration>` is how long the credentials should be valid (e.g. `1d`, `7d`, max `30d`).

The command returns the dashboard URI, username, and password directly. The credentials are temporary and expire automatically when the TTL runs out.

### 2. Open the dashboard

Use the URI, username, and password from the output to log in to the OpenSearch dashboard.

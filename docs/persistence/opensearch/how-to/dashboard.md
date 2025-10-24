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

### 1. Create a personal service account

Create a personal temporary Aiven service account using [nais-cli](../../../operate/cli/README.md):

```shell
nais aiven create opensearch \
    <username> \
    <namespace> \
    --access <access-level> \
    --instance <name-of-instance>
```
   
where `<access-level>` is one of the available [access levels](../reference/README.md#access-levels), such as `read`.

### 2. Retrieve credentials for service account

Retrieve the dashboard URI, username, and password for the service account you just created:

```shell
nais aiven get opensearch \
    <secret-name> \
    <namespace>
```

where `<secret-name>` is the name of the Kubernetes secret created in the previous step.

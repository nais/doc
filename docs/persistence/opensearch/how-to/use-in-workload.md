---
tags: [how-to, opensearch]
---

# Use OpenSearch in your workload

This guide will show you how to connect your workload to a previously created OpenSearch instance.

## Prerequisites

- You're part of a [Nais team](../../../explanations/team.md)
- You have previously [created a OpenSearch](create.md) for your team

## Steps

### 1. Add reference to OpenSearch instance in workload manifest

In your workload manifest, add the following lines to reference the OpenSearch instance:

```yaml title="nais.yaml" hl_lines="2-4"
spec:
  openSearch:
    instance: $NAME
    access: read # read | readwrite | write | admin
```

Replace `$NAME` with the name of your OpenSearch instance.
If you [created your OpenSearch through the legacy method](create-legacy.md), exclude the `opensearch-<TEAM>-` prefix.

The `access` field defines the access level your workload will have to the OpenSearch instance.
Choose the access level that fits your use case.

See the available access levels in the [OpenSearch reference](../reference/README.md#access-levels).

### 2. Find OpenSearch environment variables

When the workload is deployed, the Nais platform will inject the necessary environment variables to connect to the OpenSearch instance.

See the available environment variables in the [OpenSearch reference](../reference/README.md#environment-variables).

### 3. Use a OpenSearch client library

Use a OpenSearch client library to connect to the OpenSearch instance using the injected environment variables.

You can find a non-exhaustive list of OpenSearch clients over at the official OpenSearch page: <https://docs.opensearch.org/latest/clients/>.

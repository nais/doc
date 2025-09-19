---
title: OpenSearch reference
tags: [opensearch, reference]
---

# OpenSearch reference

## Configuration options

The `spec.openSearch` configuration allows you to reference a single OpenSearch instance with a desired access mode.

```yaml
spec:
  openSearch:
    instance: <OpenSearchInstanceName>
    access: readwrite | read | write | admin
```

For details, see the manifest reference for your workload type:

- Application: [`.spec.openSearch`](../../../workloads/application/reference/application-spec.md#opensearch)
- Job: [`.spec.openSearch`](../../../workloads/job/reference/naisjob-spec.md#opensearch)

## Environment variables

When [using an OpenSearch from your workload](../how-to/use-in-workload.md), these environment variables are available at runtime:

| Key                    | Value                                 |
|------------------------|---------------------------------------|
| `OPEN_SEARCH_URI`      | The URI for the OpenSearch instance.  |
| `OPEN_SEARCH_HOST`     | The host for the OpenSearch instance. |
| `OPEN_SEARCH_PORT`     | The port for the OpenSearch instance. |
| `OPEN_SEARCH_USERNAME` | The username to use when connecting.  |
| `OPEN_SEARCH_PASSWORD` | The password to use when connecting.  |

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

### Access levels

The access levels are as follows:

| Access level | Description                                                                                                                                |
|--------------|--------------------------------------------------------------------------------------------------------------------------------------------|
| `read`       | Allows only searching and retrieving documents. Allows access to `_search` and `_mget` APIs                                                |
| `write`      | Allows updating, adding, and deleting documents. Allows access to `_bulk`, `_mapping`, `_update_by_query`, and `_delete_by_query` APIs     |
| `readwrite`  | Grants full access to documents. Allows access to `_search`, `_mget`, `_bulk`, `_mapping`, `_update_by_query`, and `_delete_by_query` APIs |
| `admin`      | Allows unlimited access to indices                                                                                                         |

See the [Aiven documentation](https://aiven.io/docs/products/opensearch/concepts/access_control#patterns-and-permissions) for more details.

## Environment variables

When [using an OpenSearch from your workload](../how-to/use-in-workload.md), these environment variables are available at runtime:

| Key                    | Value                                 |
|------------------------|---------------------------------------|
| `OPEN_SEARCH_URI`      | The URI for the OpenSearch instance.  |
| `OPEN_SEARCH_HOST`     | The host for the OpenSearch instance. |
| `OPEN_SEARCH_PORT`     | The port for the OpenSearch instance. |
| `OPEN_SEARCH_USERNAME` | The username to use when connecting.  |
| `OPEN_SEARCH_PASSWORD` | The password to use when connecting.  |

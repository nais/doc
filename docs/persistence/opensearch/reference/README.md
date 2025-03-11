---
title: OpenSearch reference
tags: [opensearch, reference]
---

# OpenSearch reference

## Configuration options

The `spec.opensearch` configuration has two fields as you get exactly one OpenSearch instance per Application.

```yaml
    spec:
      openSearch:
        instance: <OpenSearchInstanceName>
        access: readwrite | read | write | admin
```

Specifying an OpenSearch instance will yield three environment variables in the Application

| Key                    | Value                                 |
|------------------------|---------------------------------------|
| `OPEN_SEARCH_URI`      | The URI for the OpenSearch instance.  |
| `OPEN_SEARCH_HOST`     | The host for the OpenSearch instance. |
| `OPEN_SEARCH_PORT`     | The port for the OpenSearch instance. |
| `OPEN_SEARCH_USERNAME` | The username to use when connecting.  |
| `OPEN_SEARCH_PASSWORD` | The password to use when connecting.  |

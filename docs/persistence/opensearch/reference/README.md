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

| Key                                             | Value                                 |
|-------------------------------------------------|---------------------------------------|
| `OPEN_SEARCH_URI_<Open_SearchInstanceName>`     | The URI for the OpenSearch instance.  |
| `OPEN_SEARCH_HOST_<Open_SearchInstanceName>`    | The host for the OpenSearch instance. |
| `OPEN_SEARCH_PORT_<Open_SearchInstanceName>`    | The port for the OpenSearch instance. |
| `OPEN_SEARCH_USERNAME_<OpenSearchInstanceName>` | The username to use when connecting.  |
| `OPEN_SEARCH_PASSWORD_<OpenSearchInstanceName>` | The password to use when connecting.  |

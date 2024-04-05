---
tags:
  - opensearch
---

# Opensearch

Nais provides OpenSearch by way of Aiven via their Aiven Operator.


## Configuration options

The `spec.opensearch` configuration has two fields as you get exactly one OpenSearch instance per Application.

```yaml
    spec:
      opensearch:
        instance: <OpenSearchInstanceName>
        access: readwrite | read | write | admin
```

Specifying an OpenSearch instance will yield three environment variables in the Application

| Key                                           | Value                                |
|-----------------------------------------------|--------------------------------------|
| OPEN_SEARCH_URI_<Open_SearchInstanceName>     | The URI for the OpenSearch instance. |
| OPEN_SEARCH_USERNAME_<OpenSearchInstanceName> | The username to use when connecting. |
| OPEN_SEARCH_PASSWORD_<OpenSearchInstanceName> | The password to use when connecting. |

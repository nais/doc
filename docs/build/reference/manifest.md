---
tags: [reference, build, deploy]
---

# Manifest reference

This document specifies the top-level structure and conventions for Nais
manifest files.

For an overview of concepts and workflows, see the
[Nais manifests explanation](../explanations/manifest.md).

## Top-level structure

All Nais manifests consist of four top-level keys:

```yaml
version: v1
type: <RESOURCE_TYPE>
name: <RESOURCE_NAME>
spec:
  <CONFIGURATION>
```

### Fields

| Field | Type | Required | Description |
|:------|:-----|:---------|:------------|
| `version` | `string` | Yes | Manifest schema version. Currently `v1`. |
| `type` | `string` | Yes | The kind of resource to declare (case-sensitive). Examples: `Valkey`, `OpenSearch`. |
| `name` | `string` | Yes | Unique name for the resource instance within your team's environment. |
| `spec` | `object` | Yes | Configuration specific to the resource `type`. |

### Naming constraints

The `name` field must:

- Consist only of lowercase alphanumeric characters and hyphens (`-`).
- Begin and end with an alphanumeric character.
- Be unique among resources of the same `type` within the team's environment.

## File and directory conventions

| Convention | Path format | Example |
|:-----------|:------------|:--------|
| Base directory | `.nais/` | `.nais/` |
| Base manifest | `.nais/<name>.yaml` | `.nais/valkey.yaml` |
| Environment mixin | `.nais/<name>.<environment>.yaml` | `.nais/valkey.prod-gcp.yaml` |

See [Environment mixins](../explanations/environment-mixins.md) for details on
how base manifests and mixins are merged during `nais apply`.

## Resource specifications

The fields available under `spec` depend on the resource `type`. Refer to the
corresponding reference documentation for full specifications:

- [Valkey spec](../../persistence/valkey/reference/spec.md)
- [OpenSearch spec](../../persistence/opensearch/reference/spec.md)

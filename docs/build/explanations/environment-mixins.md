---
tags: [build, deploy, explanation]
---

# Environment mixins

An environment mixin is a partial manifest that Nais merges over a base manifest
for a specific environment. It lets one set of manifests serve several
environments, so you can run different configuration in `dev` and `prod`
without duplicating the whole manifest.

You keep a base file (`.nais/app.yaml`) with the shared and development
configuration, and one file per environment named `.nais/app.<environment>.yaml`
with that environment's overrides. When you run `nais apply` with
`--environment <environment>`, the CLI deep-merges the matching mixin over the
base before deploying.

Mixins replace the old Handlebars [templating](../how-to/templating.md) approach.
Instead of a template plus a variables file rendered by `nais/deploy`, you write
plain manifests that merge together. The result is valid YAML at every step, so
editors and validators understand it, and there is no separate templating engine
to reason about.

## Merge rules

The merge follows two rules:

- **Maps and scalars are overridden.** A field set in the mixin replaces the same
  field in the base.
- **Lists are concatenated.** Items in the mixin are appended to the base list,
  not replaced.

### Map override example

A base manifest with default replicas and resource requests:

```yaml title=".nais/app.yaml"
spec:
  replicas:
    min: 1
    max: 1
  resources:
    requests:
      cpu: 20m
      memory: 64Mi
```

A production mixin that raises them:

```yaml title=".nais/app.prod.yaml"
spec:
  replicas:
    min: 2
    max: 4
  resources:
    requests:
      cpu: 100m
      memory: 256Mi
```

Applying with `--environment prod` produces:

```yaml title="merged result"
spec:
  replicas:
    min: 2
    max: 4
  resources:
    requests:
      cpu: 100m
      memory: 256Mi
```

The mixin's `replicas` and `resources` maps replace the base values entirely.

### List concatenation gotcha

Lists behave differently. If your base sets an environment variable and your
mixin tries to override it, you get both entries:

```yaml title=".nais/app.yaml"
spec:
  env:
    - name: LOG_LEVEL
      value: debug
```

```yaml title=".nais/app.prod.yaml"
spec:
  env:
    - name: LOG_LEVEL
      value: info
```

```yaml title="merged result — not what you want"
spec:
  env:
    - name: LOG_LEVEL
      value: debug
    - name: LOG_LEVEL
      value: info
```

Both entries end up in the manifest. Keep per-environment values in map fields
and avoid using mixins to change list fields like `spec.env`.

For a complete pipeline that uses mixins across multiple environments, see
[Set up a complete deploy pipeline](../how-to/deploy-pipeline.md).

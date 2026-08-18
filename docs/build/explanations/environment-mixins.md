---
tags: [build, deploy, explanation]
---

# Environment mixins

An environment mixin is a partial manifest that Nais merges over a base manifest
for a specific environment. It lets one set of manifests serve several
environments, so you can run different configuration in `dev-gcp` and `prod-gcp`
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

This has a practical consequence: put per-environment values in map fields (like
`resources` or `replicas`), where the mixin cleanly overrides the base. Avoid
relying on mixins to change list fields (like `spec.env`), because the entries
are combined rather than replaced, which is rarely what you want.

For the concrete base and mixin files this refers to, see the worked example in
[Set up a complete deploy pipeline](../how-to/deploy-pipeline.md).

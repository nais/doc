---
tags: [build, deploy, explanation]
---

# Nais manifests

A Nais manifest is a declarative configuration file that defines a resource you
want the platform to run or provision. Rather than issuing imperative commands
to create, scale, or configure resources, you declare your desired state in YAML,
and Nais reconciles the platform to match that declaration.

## Anatomy of a manifest

Every Nais manifest follows a common top-level structure composed of four
fields: `version`, `type`, `name`, and `spec`.

Here is an example declaring a Valkey cache instance:

```yaml title=".nais/valkey.yaml"
version: v1
type: Valkey
name: myvalkey
spec:
  tier: HighAvailability
  memory: 1GB
```

### `version`

The schema version of the manifest format itself. Using `version: v1` ensures
that the Nais platform interprets the fields according to that version's rules,
allowing the platform to evolve its schemas over time without breaking existing
manifests.

### `type`

The type of resource being defined. This tells Nais which platform component or
service to manage. Examples include:

- `Valkey`: In-memory key-value data store.
- `OpenSearch`: Search and analytics engine.

### `name`

The unique logical identifier for the resource instance within your team's
environment. The name is used to generate connection details, access
credentials, and platform hostnames for that specific resource.

### `spec`

The core configuration block for the resource. The contents of `spec` vary
depending on the `type` being declared. For example:

- A `Valkey` resource configures properties such as `memory`, `tier`, and
  `databases`.
- An `OpenSearch` resource configures properties such as `storageGB`, `indices`,
  and `memory`.

Each resource type has its own dedicated reference documentation describing
every supported field inside its `spec`.

## How manifests are used

Nais manifests are designed to live alongside your code and be deployed
automatically via CI/CD pipelines.

### Versioned in Git

Manifests are stored in version control, conventionally placed inside a `.nais/`
directory at the root of your repository:

```
.nais/
├── valkey.yaml
└── opensearch.yaml
```

Treating your manifests as code means changes go through standard pull request
reviews, have an audit trail, and can be easily rolled back if needed.

### Applied with GitHub Actions

In GitHub Actions workflows, manifests are applied using the
[Nais CLI](../../operate/cli/README.md) via the `nais/setup` action. When a change
is merged, GitHub Actions applies the manifest to the desired environment:

```yaml title=".github/workflows/deploy.yaml"
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: nais/setup@v1
        with:
          team: <MY-TEAM>
      - name: Apply manifest
        run: |
          nais apply .nais/valkey.yaml \
            --environment dev-gcp
```

The `nais apply` command transmits your manifest to the Nais platform. The
platform reads the declared configuration and reconciles the state—provisioning
the resource if it is new, or updating settings if the manifest has changed.

### Independent resource lifecycles

Because each resource has its own manifest file, you can manage resources
independently of your application code:

- You can provision a database or cache once, without needing to trigger a code
  deployment.
- You can resize storage or memory by updating the resource's manifest in Git
  and applying it, leaving your running workloads uninterrupted.
- You can deploy multiple manifests sequentially or concurrently in your
  deployment workflows.

### Adapting to environments

If a resource requires different sizing or configurations between environments
(for example, smaller memory in development and high availability in
production), you can pair your base manifest with
[environment mixins](environment-mixins.md). The Nais CLI automatically merges
the appropriate environment mixin (such as `.nais/valkey.prod-gcp.yaml`) over the
base manifest before applying it.

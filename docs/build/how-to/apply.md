---
tags: [build, deploy, how-to]
---

# Apply Nais TOML (preview)

!!! example "Work in progress"

This guide will show you how to apply [Nais TOML](todo-some-document-explaining-what-nais-toml-is.md) configuration files using GitHub Actions.

## Workflow example

```yaml title=".github/workflows/apply.yml" hl_lines="16-18"
name: Apply Nais TOML
on:
  push:
    branches:
      - main
  jobs:
    apply:
      name: Build, push and deploy
      runs-on: ubuntu-latest
      permissions:
        contents: read
        id-token: write
        actions: read
      steps:
        - uses: actions/checkout@v5
        - name: Setup Nais CLI
          uses: nais/setup-nais-cli@alpha
        - run: nais apply -f dev-gcp .nais/nais.toml --team myteam
```

See the reference for the `apply` command in the [Nais CLI documentation](../../operate/cli/reference/apply.md).

---
tags: [build, how-to]
---

# Schema validation and auto-completion

Use a YAML editor with [SchemaStore](https://www.schemastore.org/) support to get validation and auto-completion for Nais manifests. The editor schema covers supported resources in the [Nais manifest format](../reference/manifest.md).

For Kubernetes-style manifests such as `Application`, `Naisjob`, and `Topic`, use the [Kubernetes-style editor schemas](../../workloads/reference/json-schema.md) instead. SchemaStore may recognize their file names, but its Nais schema does not validate those resources.

## Use automatic schema selection

1. Use an editor that supports the SchemaStore catalog. In VS Code or VSCodium, install the [YAML extension](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml).
2. Create a manifest named `nais.yaml`, or a `.yaml` file directly inside a `.nais/` directory, such as `.nais/valkey.yaml`.
3. Write a manifest for a resource supported by the [Nais editor schema](https://schemas.nais.io/editor.json). The editor provides validation and auto-completion without a manual schema mapping.

## Use a different file name

If your file does not match the names above, associate it with the schema in your editor. For example, in VS Code, add this to `settings.json` to validate files in a `manifests/` directory:

```json title="settings.json"
{
  "yaml.schemas": {
    "https://schemas.nais.io/editor.json": ["manifests/*.yaml"]
  }
}
```

Adjust the file pattern to match your files. The mapping does not change which resources the schema validates.

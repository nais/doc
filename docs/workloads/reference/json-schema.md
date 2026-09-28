---
tags: [workloads, reference]
---

# Editor schemas for Kubernetes-style manifests

These schemas cover Kubernetes-style Nais manifests such as `Application`, `Naisjob`, and `Topic`. The SchemaStore schema validates supported resources in the Nais manifest format instead. For those resources, see [Schema validation and auto-completion](../../build/how-to/schema-validation-and-auto-completion.md).

**Available schemas:**

Nais resources and Kubernetes resources:

```text
https://storage.googleapis.com/nais-json-schema-2c91/nais-k8s-all.json
```

Nais resources only (`Application`, `Naisjob`, and `Topic`):

```text
https://storage.googleapis.com/nais-json-schema-2c91/nais-all.json
```

Associate one of these schemas with your files in the editor. The SchemaStore file association alone does not validate these Kubernetes-style resources.

## VSCode, VSCodium and other VSCode flavours

Install the [YAML extension](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml) from Visual Studio Marketplace. 

!!! Info "Install for non-offical distributions"
    Visit the marketplace and find "Download Extension" in the right-hand menu, under "Resources".  
		Then in your editor, open the `Extensions` page and click the `...` in the top right of the sidebar, then "Install from VSIX".  
		Alternatively, `CTRL/CMD+Shift+P` and search for `VSIX`.

### Configure
Open `settings.json` by pressing `CTRL/CMD+,` and search for `Preferences: Open Settings(JSON)`.

Add this to the root object:

```json title="settings.json"
{
  "yaml.schemas": {
    "https://storage.googleapis.com/nais-json-schema-2c91/nais-k8s-all.json": [".nais/app.yaml", ".nais/job.yaml", ".nais/topic.yaml"]
  }
}
```

This associates the Kubernetes-style schema with the listed files. Add `nais.yaml` if you use that name for a Kubernetes-style manifest. Avoid matching every file in `.nais/`: that would also select this schema for other Nais manifests.

See the [extension documentations](https://github.com/redhat-developer/vscode-yaml#associating-schemas) for more ways to associate schemas.

## IntelliJ

See the [documentation at Jetbrains](https://www.jetbrains.com/help/idea/json.html#ws_json_schema_add_custom).

Unfortunately, you will have to set this up individually per project.

## Known limitations

### Templating
One of the limitations is that the templating language used by e.g. nais-deploy isn't valid YAML.

In documents with limited templating, e.g. just having and `{{image}}`, wrapping it in quotes is usually enough when the value is a string.
For other types, there's currently no workaround.

So instead of having:

```yaml
spec:
  image: {{image}}
```

Try:

```yaml
spec:
  image: "{{image}}"
```

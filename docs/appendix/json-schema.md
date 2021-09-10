# Validation and autocompletion in editors

We expose two JSON schemas intended for use with editors to help the developer experience. 
These can be used for validation, autocompletion and documentation in supported editors.

**Available schemas:**

The following is for all nais and default kubernetes resources available.
```
https://storage.googleapis.com/nais-json-schema-2c91/nais-k8s-all.json
```

The following is only for nais resources.
```
https://storage.googleapis.com/nais-json-schema-2c91/nais-all.json
```

## VSCode, VSCodium and other VSCode flavours

Install the [YAML extension](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml) from Visual Studio Marketplace. 

!!! Info "Install for non-offical distributions"
    Visit the marketplace and find "Download Extension" in the right-hand menu, under "Resources".  
		Then in your editor, open the `Extensions` page and click the `...` in the top right of the sidebar, then "Install from VSIX".  
		Alternatively, `CTRL/CMD+Shift+P` and search for `VSIX`.

### Configure
Open `settings.json` by pressing `CTRL/CMD+,` and search for `Preferences: Open Settings(JSON)`.

Within the root object, add the following:
```json
"yaml.schemas": {
	"https://storage.googleapis.com/nais-json-schema-2c91/nais-k8s-all.json": ["nais.yaml", "nais/*", ".nais/*"],
},
```

It will enable the `nais-k8s-all.json` schema for all yaml files with the name `nais.yaml`, or in the `nais` or `.nais` directory.

See the [extension documentations](https://github.com/redhat-developer/vscode-yaml#associating-schemas) for more ways to associate schemas.

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

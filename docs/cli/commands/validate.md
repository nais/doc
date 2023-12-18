# validate command

The validate command validates the given Kubernetes YAML files against the specific resource's [JSON schema](../../appendix/json-schema.md).

```bash
nais validate path/to/nais.yaml
```

Use multiple arguments to validate multiple files:

```bash
nais validate path/to/nais.yaml path/to/another/nais.yaml
```

Available flags:

| Flag    | Required | Short | Description                                                                                            |
|---------|----------|-------|--------------------------------------------------------------------------------------------------------|
| vars    | No       |       | path to `FILE` containing template variables, must be JSON or YAML format                              |
| var     | No       |       | template variable in KEY=VALUE form, can either be a comma separated list or specified multiple times. |
| verbose | No       | -v    | print all the template variables and final resources after templating                                  |

All flags must be specified _before_ arguments:

```bash
nais validate [--vars path/to/vars.(yaml|json)] [--var key=value] path/to/nais.yaml 
```

See the [templating section](#templating) for examples.

## Supported Resources

The following resource kinds are supported:

- [Application](../../nais-application/example.md)
- [Naisjob](../../naisjob/example.md)
- [Topic (Kafka)](../../persistence/kafka/topic_example.md)

## Templating

The validate command supports templating of the YAML files, analogously to the [deploy action](../../deployment/README.md#templating).

A templated YAML file can look like this:

```yaml title="nais.yaml"
apiVersion: nais.io/v1alpha1
kind: Application
metadata:
  name: {{app}}
  namespace: some-team
  labels:
    team: some-team
spec:
  image: {{image}}
```

To validate a templated file, provide a [variable file](#variable-file) or specify the [variables as flags](#variable-flags).

### Variable File

The variable file must be in either JSON or YAML format:

=== "JSON"

    ```json title="vars.json"
    {
      "app": "some-app",
      "image": "some-image"
    }
    ```

=== "YAML"

    ```yaml title="vars.yaml"
    app: some-app
    image: some-image
    ```

Specify the path to the variable file with the `--vars` flag:

```bash
nais validate --vars vars.yaml nais.yaml
```

### Variable Flags

Specify variables in the `key=value` form with the `--var` flag.
Multiple variables can be provided as a comma separated list of pairs:

```bash
nais validate --var app=app,image=image nais.yaml
```

...or by specifying the `--var` flag multiple times:

```bash
nais validate --var app=app --var image=image nais.yaml
```

If both a variable file and variable flags are provided:

```bash
nais validate --vars vars.yaml --var image=some-other-image nais.yaml
```

...the flags will override any variables set by the file:

```bash
nais validate --vars vars.yaml --var image=some-other-image -v nais.yaml

[📝] Setting template variable 'app' to 'some-app'
[📝] Setting template variable 'image' to 'some-image'
[⚠️] Overwriting template variable 'image'; previous value was 'some-image'
[📝] Setting template variable 'image' to 'some-other-image'
...
```

## Verbose Output

The `--verbose` (shorthand `-v`) flag prints additional information, such as template variables set and the final templated resources:

```bash
nais validate --vars vars.yaml --verbose nais.yaml
```

```bash
[📝] Setting template variable 'app' to 'some-app'
[📝] Setting template variable 'image' to 'some-image'
[🖨️] Printing "nais.yaml"...
---
apiVersion: nais.io/v1alpha1
kind: Application
metadata:
  name: some-app
  namespace: some-team
  labels:
    team: some-team
spec:
  image: some-image

[✅] "nais.yaml" is valid
```

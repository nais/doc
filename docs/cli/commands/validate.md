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

| Flag | Required | Description                                                                                            |
|------|----------|--------------------------------------------------------------------------------------------------------|
| vars | No       | path to `FILE` containing template variables, must be JSON or YAML format                              |
| var  | No       | template variable in KEY=VALUE form, can either be a comma separated list or specified multiple times. |

All flags must be specified _before_ arguments:

```bash
nais validate [--vars path/to/vars.(yaml|json)] [--var app=app] path/to/nais.yaml 
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

The file must be in either JSON or YAML format:

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

Provide variables to the template resource with the `--vars` flag:

```bash
➜ nais validate --vars vars.yaml nais.yaml

Setting template variable 'app' to 'some-app'
Setting template variable 'image' to 'some-image'
nais.yaml is valid
```

### Variable Flags

Specify variables in the `key=value` form with the `--var` flag.
Multiple variables can be provided as a comma separated list of pairs:

```bash
➜ nais validate --var app=app,image=image nais.yaml

Setting template variable 'app' to 'app'
Setting template variable 'image' to 'image'
nais.yaml is valid
```

...or by specifying the `--var` flag multiple times:

```bash
➜ nais validate --var app=app --var image=image nais.yaml

Setting template variable 'app' to 'app'
Setting template variable 'image' to 'image'
nais.yaml is valid
```

Variable flags take precedence over matching variables provided by the variable file:

```bash
➜ nais validate --vars vars.yaml --var image=some-other-image nais.yaml

Setting template variable 'image' to 'some-image'
Overwriting template variable 'image'; previous value was 'some-image'
Setting template variable 'image' to 'some-other-image'
nais.yaml is valid
```

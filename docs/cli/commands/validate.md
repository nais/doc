# validate command

The validate command validates the given Kubernetes YAML files against the specific resource's [JSON schema](../../appendix/json-schema.md).

```bash
nais validate path/to/nais.yaml
```

Use multiple arguments to validate multiple files:

```bash
nais validate path/to/nais.yaml path/to/another/nais.yaml
```

The following resource kinds are supported:

- [Application](../../nais-application/example.md)
- [Naisjob](../../naisjob/example.md)
- [Topic (Kafka)](../../persistence/kafka/topic_example.md)

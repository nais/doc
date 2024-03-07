# Secrets

This is the reference documentation for [secrets](../explanation/secrets.md) on the NAIS platform.

## Console

Visit [NAIS Console :octicons-link-external-16:](https://console.<<tenant()>>.cloud.nais.io) to find and manage your team's user-defined secrets.

## How-To Guides

- :dart: [Get started with secrets in Console](../how-to-guides/secrets/console.md)
- :dart: [Use a secret in your workloads](../how-to-guides/secrets/workloads.md)

## Workloads

Use a secret in your [workload](../explanation/workloads/README.md) by referencing them in your `nais.yaml` manifest.

The secret can be made available as environment variables or files.

### Environment Variables

```yaml
spec:
  envFrom:
    - secret: <secret-name>
```

See also:

- :clipboard: [Application reference](../reference/application-spec.md#envfromsecret)
- :clipboard: [NaisJob reference](../reference/naisjob-spec.md#envfromsecret)

### Files

```yaml
spec:
  filesFrom:
    - secret: <secret-name>
      mountPath: /var/run/secrets/<secret-name>
```

See also:

- :clipboard: [Application reference](../reference/application-spec.md#filesfromsecret)
- :clipboard: [NaisJob reference](../reference/naisjob-spec.md#filesfromsecret)

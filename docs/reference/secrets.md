# Secrets

This is the reference documentation for [secrets](../explanation/secrets.md) on the NAIS platform.

## Console

Find and manage your team's user-defined secrets in the [NAIS Console](https://console.<<tenant()>>.cloud.nais.io).

## Workloads

Use a secret in your [workload](../explanation/workloads/README.md) by referencing them in your `nais.yaml` manifest.
The secret can be made available as environment variables, files, or both.

### Environment Variables

```yaml
spec:
  envFrom:
    - secret: <secret-name>
```

See the workload references for more information:

- [Application](../reference/application-spec.md#envfromsecret)
- [NaisJob](../reference/naisjob-spec.md#envfromsecret)

### Files

```yaml
spec:
  filesFrom:
    - secret: <secret-name>
      mountPath: /var/run/secrets/<secret-name>
```

See the workload references for more information:

- [Application](../reference/application-spec.md#filesfromsecret)
- [NaisJob](../reference/naisjob-spec.md#filesfromsecret)

## How-Tos

- [Create a secret and use it in your workload](../how-to-guides/secrets.md)
